import { useRuntimeConfig } from '#imports'
import { createDatabase } from 'db0'
import { createError, defineEventHandler, getHeader } from 'h3'
import type { ModuleOptions } from '~/src/module'

const getConnector = async (name: string) => {
  switch (name) {
    /*
    waiting for db0 v 0.2 included in nitro
    case 'mysql':
      return (await import('db0/connectors/mysql2')).default
    */
    case 'postgresql':
      return (await import('db0/connectors/postgresql')).default
    case 'sqlite':
      return (await import('db0/connectors/better-sqlite3')).default
    default:
      throw new Error(`Unsupported database connector: ${name}`)
  }
}

const useDb = async (options: ModuleOptions) => {
  const connectorName = options.connector!.name
  const connector = await getConnector(connectorName)
  return createDatabase(connector(options.connector!.options))
}

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
    const db = await useDb(options)
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
