import type { Database } from 'db0'
import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'

let db: Database

const createTestDatabase = async (config: { authTable: string, tokenField: string, connector: { options: Record<string, any> } }) => {
  db = createDatabase(sqlite(config.connector!.options))

  // For migrations test, we don't need to create the old table structure
  // The migrations will handle creating the proper tables
  if (config.connector!.options.path.includes('migrations')) {
    // Just ensure the database file exists
    return
  }

  await db.sql`CREATE TABLE IF NOT EXISTS {${config.authTable}} ("id" TEXT PRIMARY KEY, "name" TEXT, "email" TEXT, "{${config.tokenField}}" TEXT)`
  await db.sql`INSERT INTO {${config.authTable}} VALUES (1, 'Gauranga', 'rrd@webmania.cc', 'Gauranga%TestToken0123456789')`
}

// New function to drop the database
const dropTestDatabase = async (config: { authTable: string, connector: { options: Record<string, any> } }) => {
  // For migrations test, clean up all tables
  if (config.connector!.options.path.includes('migrations')) {
    await db.sql`DROP TABLE IF EXISTS migrations`
    await db.sql`DROP TABLE IF EXISTS personal_access_tokens`
    await db.sql`DROP TABLE IF EXISTS users`
    await db.sql`DROP TABLE IF EXISTS password_reset_tokens`
    return
  }

  await db.sql`DROP TABLE IF EXISTS {${config.authTable}}`
}

export { createTestDatabase, dropTestDatabase }
