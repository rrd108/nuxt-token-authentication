import { useRuntimeConfig } from '#imports'
import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'
import { createError, defineEventHandler, getHeader } from 'h3'

const useDb = (options: any) => createDatabase(sqlite(options.connector.options))

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
    const db = useDb(options)
    const { rows } = await db.sql`SELECT * FROM {${options.authTable}} WHERE {${options.tokenField}} = ${strippedToken} LIMIT 1`
    user = rows?.[0]
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
