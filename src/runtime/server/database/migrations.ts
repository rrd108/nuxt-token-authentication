import type { Database } from 'db0'
import type { ModuleOptions } from '../../../module'

export interface Migration {
    version: number
    name: string
    up: (db: Database, options: ModuleOptions) => Promise<void>
    down: (db: Database, options: ModuleOptions) => Promise<void>
}

export interface MigrationRecord {
    id: number
    version: number
    name: string
    executed_at: string
}

// Migration 1: Create personal_access_tokens table
const createPersonalAccessTokensTable: Migration = {
    version: 1,
    name: 'create_personal_access_tokens_table',
    up: async (db: Database, options: ModuleOptions) => {
        await db.sql`
      CREATE TABLE IF NOT EXISTS personal_access_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tokenable_type TEXT NOT NULL,
        tokenable_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        abilities TEXT,
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // Create indexes for better performance
        await db.sql`CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_tokenable ON personal_access_tokens(tokenable_type, tokenable_id)`
        await db.sql`CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_token ON personal_access_tokens(token)`
        await db.sql`CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_expires ON personal_access_tokens(expires_at)`
    },
    down: async (db: Database) => {
        await db.sql`DROP TABLE IF EXISTS personal_access_tokens`
    },
}

// Migration 2: Create migrations table
const createMigrationsTable: Migration = {
    version: 2,
    name: 'create_migrations_table',
    up: async (db: Database) => {
        await db.sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        name TEXT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    },
    down: async (db: Database) => {
        await db.sql`DROP TABLE IF EXISTS migrations`
    },
}

// Migration 3: Update users table with timestamps and proper structure
const updateUsersTable: Migration = {
    version: 3,
    name: 'update_users_table',
    up: async (db: Database, options: ModuleOptions) => {
        // Check if users table exists and has the required columns
        const tableExists = await db.sql`SELECT name FROM sqlite_master WHERE type='table' AND name={${options.authTable}}`

        if (tableExists.rows?.length === 0) {
            // Create users table if it doesn't exist
            await db.sql`CREATE TABLE {${options.authTable}} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email_verified_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        }
        else {
            // Add missing columns to existing table
            const columns = await db.sql`PRAGMA table_info({${options.authTable}})`
            const columnNames = columns.rows?.map((col: any) => col.name) || []

            if (!columnNames.includes('created_at')) {
                await db.sql`ALTER TABLE {${options.authTable}} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
            }

            if (!columnNames.includes('updated_at')) {
                await db.sql`ALTER TABLE {${options.authTable}} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
            }

            if (!columnNames.includes('email_verified_at')) {
                await db.sql`ALTER TABLE {${options.authTable}} ADD COLUMN email_verified_at TIMESTAMP`
            }

            if (!columnNames.includes('password')) {
                await db.sql`ALTER TABLE {${options.authTable}} ADD COLUMN password TEXT`
            }
        }

        // Create indexes
        await db.sql`CREATE INDEX IF NOT EXISTS idx_users_email ON {${options.authTable}}(email)`
    },
    down: async (db: Database, options: ModuleOptions) => {
        // This migration doesn't have a proper down migration as it modifies existing table
        // In production, you might want to create a backup before running this
        console.warn('Down migration for update_users_table is not implemented for safety')
    },
}

// Migration 4: Create password reset tokens table
const createPasswordResetTokensTable: Migration = {
    version: 4,
    name: 'create_password_reset_tokens_table',
    up: async (db: Database) => {
        await db.sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        await db.sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email)`
        await db.sql`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)`
    },
    down: async (db: Database) => {
        await db.sql`DROP TABLE IF EXISTS password_reset_tokens`
    },
}

// All migrations in order
export const migrations: Migration[] = [
    createMigrationsTable,
    createPersonalAccessTokensTable,
    updateUsersTable,
    createPasswordResetTokensTable,
]

export class MigrationManager {
    private db: Database
    private options: ModuleOptions

    constructor(db: Database, options: ModuleOptions) {
        this.db = db
        this.options = options
    }

    async getExecutedMigrations(): Promise<MigrationRecord[]> {
        try {
            const result = await this.db.sql`SELECT * FROM migrations ORDER BY version ASC`
            return (result.rows || []).map((row: any) => ({
                id: Number(row.id),
                version: Number(row.version),
                name: String(row.name),
                executed_at: String(row.executed_at),
            }))
        }
        catch (error) {
            // If migrations table doesn't exist, return empty array
            return []
        }
    }

    async markMigrationAsExecuted(migration: Migration): Promise<void> {
        await this.db.sql`
      INSERT INTO migrations (version, name, executed_at) 
      VALUES (${migration.version}, ${migration.name}, CURRENT_TIMESTAMP)
    `
    }

    async markMigrationAsRolledBack(migration: Migration): Promise<void> {
        await this.db.sql`DELETE FROM migrations WHERE version = ${migration.version}`
    }

    async migrate(): Promise<void> {
        const executedMigrations = await this.getExecutedMigrations()
        const executedVersions = new Set(executedMigrations.map(m => m.version))

        const pendingMigrations = migrations.filter(m => !executedVersions.has(m.version))

        if (pendingMigrations.length === 0) {
            console.log('No pending migrations')
            return
        }

        console.log(`Running ${pendingMigrations.length} migrations...`)

        for (const migration of pendingMigrations) {
            try {
                console.log(`Running migration: ${migration.name} (v${migration.version})`)
                await migration.up(this.db, this.options)
                await this.markMigrationAsExecuted(migration)
                console.log(`✓ Migration ${migration.name} completed`)
            }
            catch (error) {
                console.error(`✗ Migration ${migration.name} failed:`, error)
                throw error
            }
        }
    }

    async rollback(steps: number = 1): Promise<void> {
        const executedMigrations = await this.getExecutedMigrations()
        const migrationsToRollback = executedMigrations
            .sort((a, b) => b.version - a.version)
            .slice(0, steps)

        if (migrationsToRollback.length === 0) {
            console.log('No migrations to rollback')
            return
        }

        console.log(`Rolling back ${migrationsToRollback.length} migrations...`)

        for (const migrationRecord of migrationsToRollback) {
            const migration = migrations.find(m => m.version === migrationRecord.version)
            if (!migration) {
                console.warn(`Migration ${migrationRecord.name} not found in migration list`)
                continue
            }

            try {
                console.log(`Rolling back migration: ${migration.name} (v${migration.version})`)
                await migration.down(this.db, this.options)
                await this.markMigrationAsRolledBack(migration)
                console.log(`✓ Migration ${migration.name} rolled back`)
            }
            catch (error) {
                console.error(`✗ Rollback of ${migration.name} failed:`, error)
                throw error
            }
        }
    }

    async status(): Promise<{ executed: MigrationRecord[], pending: Migration[] }> {
        const executedMigrations = await this.getExecutedMigrations()
        const executedVersions = new Set(executedMigrations.map(m => m.version))

        const pendingMigrations = migrations.filter(m => !executedVersions.has(m.version))

        return {
            executed: executedMigrations,
            pending: pendingMigrations,
        }
    }
}
