import type { Database } from 'db0'
import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'

const createTestDatabase = async (table = 'users', tokenField = 'token') => {
    const db = createDatabase(
        sqlite({
            name: ':memory:',
        }),
    )
    await db.sql`CREATE TABLE IF NOT EXISTS {${table}} ("id" TEXT PRIMARY KEY, "name" TEXT, "email" TEXT, "{${tokenField}}" TEXT)`

    await db.sql`INSERT INTO {${table}} VALUES (1, 'Gauranga', 'rrd@webmania.cc', 'Gauranga%TestToken0123456789')`
    return db
}

// New function to drop the database
const dropTestDatabase = async (db: Database, table = 'users') => {
    await db.sql`DROP TABLE IF EXISTS {${table}}`
}

export { createTestDatabase, dropTestDatabase }
