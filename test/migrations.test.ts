import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { createDatabase } from 'db0'
import sqlite from 'db0/connectors/better-sqlite3'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { defaultOptions } from '../src/module'
import { MigrationManager } from '../src/runtime/server/database/migrations'

const testOptions = {
    ...defaultOptions,
    connector: {
        name: 'sqlite' as const,
        options: {
            path: './test/data/migrations.sqlite3',
        },
    },
}

describe('migration System', () => {
    let db: any
    let migrationManager: MigrationManager

    beforeAll(async () => {
        // Create test database
        db = createDatabase(sqlite(testOptions.connector!.options))
        migrationManager = new MigrationManager(db, testOptions)
    })

    afterAll(async () => {
        // Clean up test database
        try {
            await db.sql`DROP TABLE IF EXISTS migrations`
            await db.sql`DROP TABLE IF EXISTS personal_access_tokens`
            await db.sql`DROP TABLE IF EXISTS users`
            await db.sql`DROP TABLE IF EXISTS password_reset_tokens`
        }
        catch (error) {
            console.warn('Cleanup failed:', error)
        }
    })

    it('should run migrations successfully', async () => {
        const statusBefore = await migrationManager.status()
        expect(statusBefore.executed).toHaveLength(0)
        expect(statusBefore.pending.length).toBeGreaterThan(0)

        await migrationManager.migrate()

        const statusAfter = await migrationManager.status()
        expect(statusAfter.pending).toHaveLength(0)
        expect(statusAfter.executed.length).toBeGreaterThan(0)
    })

    it('should create all required tables', async () => {
        // Check if migrations table exists
        const migrationsTable = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'`
        expect(migrationsTable.rows).toHaveLength(1)

        // Check if personal_access_tokens table exists
        const tokensTable = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='personal_access_tokens'`
        expect(tokensTable.rows).toHaveLength(1)

        // Check if users table exists
        const usersTable = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`
        expect(usersTable.rows).toHaveLength(1)

        // Check if password_reset_tokens table exists
        const resetTable = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name='password_reset_tokens'`
        expect(resetTable.rows).toHaveLength(1)
    })

    it('should have correct table structure', async () => {
        // Check personal_access_tokens table structure
        const tokenColumns = await db.sql`PRAGMA table_info(personal_access_tokens)`
        const tokenColumnNames = tokenColumns.rows.map((col: any) => col.name)

        expect(tokenColumnNames).toContain('id')
        expect(tokenColumnNames).toContain('tokenable_type')
        expect(tokenColumnNames).toContain('tokenable_id')
        expect(tokenColumnNames).toContain('name')
        expect(tokenColumnNames).toContain('token')
        expect(tokenColumnNames).toContain('abilities')
        expect(tokenColumnNames).toContain('last_used_at')
        expect(tokenColumnNames).toContain('expires_at')
        expect(tokenColumnNames).toContain('created_at')
        expect(tokenColumnNames).toContain('updated_at')

        // Check users table structure
        const userColumns = await db.sql`PRAGMA table_info(users)`
        const userColumnNames = userColumns.rows.map((col: any) => col.name)

        expect(userColumnNames).toContain('id')
        expect(userColumnNames).toContain('name')
        expect(userColumnNames).toContain('email')
        expect(userColumnNames).toContain('password')
        expect(userColumnNames).toContain('email_verified_at')
        expect(userColumnNames).toContain('created_at')
        expect(userColumnNames).toContain('updated_at')
    })

    it('should create required indexes', async () => {
        // Check if indexes exist
        const indexes = await db.sql`SELECT name FROM sqlite_master WHERE type='index'`
        const indexNames = indexes.rows.map((idx: any) => idx.name)

        expect(indexNames).toContain('idx_personal_access_tokens_tokenable')
        expect(indexNames).toContain('idx_personal_access_tokens_token')
        expect(indexNames).toContain('idx_personal_access_tokens_expires')
        expect(indexNames).toContain('idx_users_email')
        expect(indexNames).toContain('idx_password_reset_tokens_email')
        expect(indexNames).toContain('idx_password_reset_tokens_token')
    })

    it('should track migration execution', async () => {
        const migrations = await db.sql`SELECT * FROM migrations ORDER BY version ASC`
        expect(migrations.rows.length).toBeGreaterThan(0)

        // Check that all expected migrations are recorded
        const migrationNames = migrations.rows.map((m: any) => m.name)
        expect(migrationNames).toContain('create_migrations_table')
        expect(migrationNames).toContain('create_personal_access_tokens_table')
        expect(migrationNames).toContain('update_users_table')
        expect(migrationNames).toContain('create_password_reset_tokens_table')
    })

    it('should not run migrations twice', async () => {
        const statusBefore = await migrationManager.status()
        const executedCount = statusBefore.executed.length

        await migrationManager.migrate()

        const statusAfter = await migrationManager.status()
        expect(statusAfter.executed.length).toBe(executedCount)
        expect(statusAfter.pending).toHaveLength(0)
    })
})
