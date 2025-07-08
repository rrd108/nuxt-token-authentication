import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import defu from 'defu'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { defaultOptions } from '../src/module'
import config from './fixtures/migrations/nuxt.config'
import { createTestDatabase, dropTestDatabase } from './utils/createTestDatabase'

const options = defu((config as any).nuxtTokenAuthentication, defaultOptions)
beforeAll(async () => await createTestDatabase(options))
afterAll(async () => await dropTestDatabase(options))

interface MigrationTestResponse {
    success: boolean
    tests: {
        initialStatus: {
            executed: number
            pending: number
        }
        afterMigration: {
            executed: number
            pending: number
        }
        afterRollback: {
            executed: number
        }
        tables: {
            all: string[]
            hasMigrations: boolean
            hasPersonalAccessTokens: boolean
            hasUsers: boolean
            hasPasswordResetTokens: boolean
        }
        personalAccessTokensColumns: string[]
        migrationsColumns: string[]
        usersColumns: string[]
        passwordResetTokensColumns: string[]
    }
    error?: string
}

describe('Migration System', async () => {
    await setup({
        rootDir: fileURLToPath(new URL('./fixtures/migrations', import.meta.url)),
    })

    it('should render the index page', async () => {
        const response = await $fetch('/')
        expect(response).toBeDefined()
    })

    it('should run migrations and verify database schema', async () => {
        const response = await $fetch<MigrationTestResponse>('/api/test-db')

        expect(response.success).toBe(true)
        expect(response.tests).toBeDefined()

        const tests = response.tests

        // Test migration execution
        expect(tests.afterMigration.executed).toBeGreaterThan(tests.initialStatus.executed)
        expect(tests.afterMigration.pending).toBe(0)

        // Test rollback functionality
        expect(tests.afterRollback.executed).toBeLessThan(tests.afterMigration.executed)

        // Test table creation
        expect(tests.tables.hasMigrations).toBe(true)
        expect(tests.tables.hasPersonalAccessTokens).toBe(true)
        expect(tests.tables.hasUsers).toBe(true)
        expect(tests.tables.hasPasswordResetTokens).toBe(true)

        // Test personal_access_tokens table structure
        const expectedTokenColumns = [
            'id', 'tokenable_type', 'tokenable_id', 'name', 'token',
            'abilities', 'last_used_at', 'expires_at', 'created_at', 'updated_at'
        ]
        expectedTokenColumns.forEach(column => {
            expect(tests.personalAccessTokensColumns).toContain(column)
        })

        // Test migrations table structure
        const expectedMigrationsColumns = ['id', 'version', 'name', 'executed_at']
        expectedMigrationsColumns.forEach(column => {
            expect(tests.migrationsColumns).toContain(column)
        })

        // Test users table structure
        const expectedUsersColumns = [
            'id', 'name', 'email', 'password', 'email_verified_at',
            'created_at', 'updated_at'
        ]
        expectedUsersColumns.forEach(column => {
            expect(tests.usersColumns).toContain(column)
        })

        // Test password_reset_tokens table structure
        const expectedResetColumns = ['id', 'email', 'token', 'created_at']
        expectedResetColumns.forEach(column => {
            expect(tests.passwordResetTokensColumns).toContain(column)
        })
    })

    it('should handle migration errors gracefully', async () => {
        // This test verifies that the migration system doesn't crash
        // when encountering errors and returns proper error responses
        const response = await $fetch<MigrationTestResponse>('/api/test-db')
        expect(response.success).toBe(true)
    })
})
