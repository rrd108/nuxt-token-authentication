import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // check if the requested route starts with api
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  const options = useRuntimeConfig().public.nuxtTokenAuthentication

  if (
    options.noAuthRoutes.includes(
      `${event.node.req.method}:${event.node.req.url}`,
    )
  ) {
    return
  }

  const token = getHeader(event, options.tokenHeader)
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Authentication header',
    })
  }

  const strippedToken = token.replace(`${options.prefix} `, '')
  let user
  try {
    const db = useDatabase()
    // for table names we need and extra {} - see https://github.com/unjs/db0/issues/77
    const { rows }
      = await db.sql`SELECT * FROM {${options.authTable}} WHERE {${options.tokenField}} = ${strippedToken} LIMIT 1`
    user = rows[0]
  }
  catch (error) {
    console.error({ error })
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication error',
    })
  }
})
