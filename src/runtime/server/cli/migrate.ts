#!/usr/bin/env node

import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'
import { defaultOptions } from '../../../module'
import { MigrationManager } from '../database/migrations'

const args = process.argv.slice(2)
const command = args[0]

const options = {
    ...defaultOptions,
    connector: {
        name: 'sqlite' as const,
        options: {
            path: './data/db.sqlite3',
        },
    },
}

async function runMigrations() {
    try {
        const db = createDatabase(sqlite(options.connector!.options))
        const migrationManager = new MigrationManager(db, options)

        console.log('Running database migrations...')
        await migrationManager.migrate()
        console.log('Migrations completed successfully!')
    }
    catch (error) {
        console.error('Migration failed:', error)
        process.exit(1)
    }
}

async function showStatus() {
    try {
        const db = createDatabase(sqlite(options.connector!.options))
        const migrationManager = new MigrationManager(db, options)

        const status = await migrationManager.status()

        console.log('\nMigration Status:')
        console.log('================')

        if (status.executed.length > 0) {
            console.log('\nExecuted migrations:')
            status.executed.forEach((migration) => {
                console.log(`  ✓ ${migration.name} (v${migration.version}) - ${migration.executed_at}`)
            })
        }

        if (status.pending.length > 0) {
            console.log('\nPending migrations:')
            status.pending.forEach((migration) => {
                console.log(`  ⏳ ${migration.name} (v${migration.version})`)
            })
        }
        else {
            console.log('\nNo pending migrations.')
        }
    }
    catch (error) {
        console.error('Failed to get migration status:', error)
        process.exit(1)
    }
}

async function rollbackMigrations() {
    const steps = Number.parseInt(args[1]) || 1

    try {
        const db = createDatabase(sqlite(options.connector!.options))
        const migrationManager = new MigrationManager(db, options)

        console.log(`Rolling back ${steps} migration(s)...`)
        await migrationManager.rollback(steps)
        console.log('Rollback completed successfully!')
    }
    catch (error) {
        console.error('Rollback failed:', error)
        process.exit(1)
    }
}

async function main() {
    switch (command) {
        case 'migrate':
        case 'up':
            await runMigrations()
            break
        case 'status':
            await showStatus()
            break
        case 'rollback':
        case 'down':
            await rollbackMigrations()
            break
        default:
            console.log(`
Usage: npx nuxt-token-authentication migrate [command]

Commands:
  migrate, up     Run pending migrations
  status          Show migration status
  rollback, down  Rollback migrations (optionally specify number of steps)

Examples:
  npx nuxt-token-authentication migrate up
  npx nuxt-token-authentication migrate status
  npx nuxt-token-authentication migrate rollback 2
      `)
            process.exit(1)
    }
}

main().catch((error) => {
    console.error('CLI error:', error)
    process.exit(1)
})
