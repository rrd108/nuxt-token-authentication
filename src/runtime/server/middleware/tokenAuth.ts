import { useRuntimeConfig, useDatabase } from '#imports' // Use Nitro's useDatabase
import { createError, defineEventHandler, getHeader, H3Event } from 'h3'
import type { ModuleOptions } from '../../../module' // Adjusted path

// Helper to check if the current request path matches any of the noAuthRoutes
function isNoAuthRoute(event: H3Event, options: ModuleOptions): boolean {
  const path = event.path?.split('?')[0] || ''
  if (!path.startsWith('/api/')) { // Only apply auth to /api routes by default, can be configured
    return true; // Not an API route, so skip auth
  }

  return options.noAuthRoutes.some(noAuthPattern => {
    if (noAuthPattern.includes(':')) {
      const [method, patternPath] = noAuthPattern.split(':', 2)
      if (method !== event.method && method !== '*') return false // Method mismatch

      // Basic wildcard support or regex matching can be implemented here if needed
      // For now, assume exact match or simple prefix match for paths like /api/auth/*
      if (patternPath.endsWith('*')) {
        return path.startsWith(patternPath.slice(0, -1))
      }
      return patternPath === path
    }
    // If no method specified, just match path
    if (noAuthPattern.endsWith('*')) {
        return path.startsWith(noAuthPattern.slice(0, -1))
    }
    return noAuthPattern === path
  })
}

export default defineEventHandler(async (event) => {
  const options = useRuntimeConfig().public.nuxtTokenAuthentication as ModuleOptions

  if (isNoAuthRoute(event, options)) {
    return // Skip auth for this route
  }

  let rawToken: string | null | undefined = null
  const authHeader = getHeader(event, 'Authorization')
  const customHeaderName = options.tokenHeader

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    rawToken = authHeader.substring(7)
  } else if (customHeaderName && customHeaderName !== 'Authorization') {
    // Fallback to custom header if specified and different from Authorization
    rawToken = getHeader(event, customHeaderName)
    // If using a custom header, the `options.prefix` might apply for stripping
    if (rawToken && options.prefix && rawToken.startsWith(options.prefix)) {
        rawToken = rawToken.substring(options.prefix.length).trim()
    }
  }


  if (!rawToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Missing token',
    })
  }

  const db = useDatabase() // Use Nitro's auto-imported database instance

  // 1. Find the token in the personal_access_tokens table
  let tokenEntry: any
  try {
    const result = await db.sql`
      SELECT * FROM {${options.tokenTable}}
      WHERE token = ${rawToken}
      LIMIT 1
    `
    tokenEntry = result.rows?.[0]
  } catch (dbError) {
    console.error('Database error validating token:', dbError)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }

  if (!tokenEntry) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' })
  }

  // 2. Check if the token has expired
  if (tokenEntry.expires_at) {
    const expiryDate = new Date(tokenEntry.expires_at)
    if (expiryDate < new Date()) {
      // Optionally, delete the expired token
      // await db.sql`DELETE FROM {${options.tokenTable}} WHERE id = ${tokenEntry.id}`
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token expired' })
    }
  }

  // 3. (Optional) Update last_used_at
  // await db.sql`UPDATE {${options.tokenTable}} SET last_used_at = CURRENT_TIMESTAMP WHERE id = ${tokenEntry.id}`

  // 4. Retrieve the associated user
  // Assuming tokenable_type is 'user' or similar, matching the authTable name convention or a fixed value
  // For simplicity, let's assume options.authTable is the correct table for users.
  // A more robust system might use tokenable_type to determine the table.
  if (!tokenEntry.tokenable_id) {
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token not associated with a user' })
  }

  let user: any
  try {
    const userResult = await db.sql`
      SELECT * FROM {${options.authTable}}
      WHERE id = ${tokenEntry.tokenable_id}
      LIMIT 1`
    user = userResult.rows?.[0]
  } catch (dbError) {
    console.error('Database error fetching user for token:', dbError)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: User not found for token' })
  }

  // Remove password from user object before attaching to context
  const { password, ...userWithoutPassword } = user

  // 5. Attach user to event context
  event.context.auth = { user: userWithoutPassword, token: tokenEntry }
  // console.log(`User ${user.email} authenticated via token for path ${event.path}`)
})
