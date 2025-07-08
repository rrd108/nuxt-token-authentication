import { MigrationManager } from '../../../../../src/runtime/server/database/migrations'
import { useDatabaseService } from '../../../../../src/runtime/server/database/service'

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()
    const options = config.nuxtTokenAuthentication

    try {
        // Get database service
        const dbService = useDatabaseService(options)
        const db = await dbService.getDatabase()
        const migrationManager = new MigrationManager(db, options)

        // Test 1: Check initial status
        const initialStatus = await migrationManager.status()
        const initialExecutedCount = initialStatus.executed.length
        const initialPendingCount = initialStatus.pending.length

        // Test 2: Run migrations
        await migrationManager.migrate()

        // Test 3: Check status after migration
        const afterMigrationStatus = await migrationManager.status()
        const afterMigrationExecutedCount = afterMigrationStatus.executed.length
        const afterMigrationPendingCount = afterMigrationStatus.pending.length

        // Test 4: Verify tables exist
        const tables = await db.sql`SELECT name FROM sqlite_master WHERE type='table'`
        const tableNames = tables.rows?.map((row: any) => row.name) || []

        // Test 5: Verify personal_access_tokens table structure
        const tokenTableColumns = await db.sql`PRAGMA table_info(personal_access_tokens)`
        const tokenColumnNames = tokenTableColumns.rows?.map((col: any) => col.name) || []

        // Test 6: Verify migrations table structure
        const migrationsTableColumns = await db.sql`PRAGMA table_info(migrations)`
        const migrationsColumnNames = migrationsTableColumns.rows?.map((col: any) => col.name) || []

        // Test 7: Verify users table structure (if it exists)
        const usersTableColumns = await db.sql`PRAGMA table_info(${options.authTable})`
        const usersColumnNames = usersTableColumns.rows?.map((col: any) => col.name) || []

        // Test 8: Verify password_reset_tokens table structure
        const resetTableColumns = await db.sql`PRAGMA table_info(password_reset_tokens)`
        const resetColumnNames = resetTableColumns.rows?.map((col: any) => col.name) || []

        // Test 9: Test rollback (rollback 1 migration)
        await migrationManager.rollback(1)
        const afterRollbackStatus = await migrationManager.status()
        const afterRollbackExecutedCount = afterRollbackStatus.executed.length

        // Test 10: Run migration again to restore
        await migrationManager.migrate()

        return {
            success: true,
            tests: {
                initialStatus: {
                    executed: initialExecutedCount,
                    pending: initialPendingCount,
                },
                afterMigration: {
                    executed: afterMigrationExecutedCount,
                    pending: afterMigrationPendingCount,
                },
                afterRollback: {
                    executed: afterRollbackExecutedCount,
                },
                tables: {
                    all: tableNames,
                    hasMigrations: tableNames.includes('migrations'),
                    hasPersonalAccessTokens: tableNames.includes('personal_access_tokens'),
                    hasUsers: tableNames.includes(options.authTable),
                    hasPasswordResetTokens: tableNames.includes('password_reset_tokens'),
                },
                personalAccessTokensColumns: tokenColumnNames,
                migrationsColumns: migrationsColumnNames,
                usersColumns: usersColumnNames,
                passwordResetTokensColumns: resetColumnNames,
            },
        }
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        }
    }
})
