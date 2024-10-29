import type { Database } from 'db0'
import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'

let db: Database

const createTestDatabase = async (config: { authTable: string, tokenField: string, connector: { options: Record<string, any> } }) => {
  db = createDatabase(sqlite(config.connector!.options))
  await db.sql`CREATE TABLE IF NOT EXISTS {${config.authTable}} ("id" TEXT PRIMARY KEY, "name" TEXT, "email" TEXT, "{${config.tokenField}}" TEXT)`
  await db.sql`INSERT INTO {${config.authTable}} VALUES (1, 'Gauranga', 'rrd@webmania.cc', 'Gauranga%TestToken0123456789')`
}

// New function to drop the database
const dropTestDatabase = async (config: { authTable: string }) => {
  await db.sql`DROP TABLE IF EXISTS {${config.authTable}}`
}

export { createTestDatabase, dropTestDatabase }
