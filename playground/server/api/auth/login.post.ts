import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcrypt'
import { useDatabase } from '#imports' // Assuming db0 is auto-imported

// TODO: Replace with a more secure way to generate tokens
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const options = useRuntimeConfig().public.nuxtTokenAuthentication
  const body = await readBody(event)

  // 1. Validate input
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  // 2. Retrieve user by email
  let user
  try {
    const { rows } = await db.sql`
      SELECT id, email, password, name FROM {${options.authTable}}
      WHERE email = ${body.email}
      LIMIT 1
    `
    if (rows && rows.length > 0) {
      user = rows[0]
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials', // Generic message for security
    })
  }

  // 3. Compare password
  const isPasswordValid = await bcrypt.compare(body.password, String(user.password))
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials', // Generic message for security
    })
  }

  // 4. Generate access token
  const token = randomBytes(32).toString('hex') // Simple token for now
  const tokenName = 'api-token' // Or allow customization

  const tokenExpiration = options.tokenExpiration || (60 * 60 * 24 * 365) // Default 1 year
  const expiresAt = new Date(Date.now() + tokenExpiration * 1000)

  // 5. Store token in personal_access_tokens table
  try {
    await db.sql`
      INSERT INTO {${options.tokenTable}} (tokenable_type, tokenable_id, name, token, expires_at)
      VALUES ('user', ${user.id}, ${tokenName}, ${token}, ${expiresAt.toISOString()})
    `
  } catch (error) {
    console.error('Error storing token:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not create token',
    })
  }

  // 6. Return token and user info (excluding password)
  const { password, ...userWithoutPassword } = user
  return {
    token,
    user: userWithoutPassword,
    expires_at: expiresAt.toISOString(),
  }
})
