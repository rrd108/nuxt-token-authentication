import { createDatabase } from 'db0'
import type { Database } from 'db0'
import type { ModuleOptions } from '../../../module'
import { MigrationManager } from './migrations'

const getConnector = async (name: string) => {
    switch (name) {
        case 'mysql':
            return (await import('db0/connectors/mysql2')).default
        case 'postgresql':
            return (await import('db0/connectors/postgresql')).default
        case 'sqlite':
            return (await import('db0/connectors/better-sqlite3')).default
        default:
            throw new Error(`Unsupported database connector: ${name}`)
    }
}

export class DatabaseService {
    private db: Database | null = null
    private options: ModuleOptions
    private migrationManager: MigrationManager | null = null

    constructor(options: ModuleOptions) {
        this.options = options
    }

    async connect(): Promise<Database> {
        if (this.db) {
            return this.db
        }

        const connectorName = this.options.connector!.name
        const connector = await getConnector(connectorName)
        this.db = createDatabase(connector(this.options.connector!.options))

        // Initialize migration manager
        this.migrationManager = new MigrationManager(this.db, this.options)

        return this.db
    }

    async getDatabase(): Promise<Database> {
        return await this.connect()
    }

    async runMigrations(): Promise<void> {
        if (!this.migrationManager) {
            await this.connect()
        }

        await this.migrationManager!.migrate()
    }

    async getMigrationStatus() {
        if (!this.migrationManager) {
            await this.connect()
        }

        return await this.migrationManager!.status()
    }

    async rollbackMigrations(steps: number = 1): Promise<void> {
        if (!this.migrationManager) {
            await this.connect()
        }

        await this.migrationManager!.rollback(steps)
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            // Note: db0 doesn't have a disconnect method, but we can clear the reference
            this.db = null
            this.migrationManager = null
        }
    }
}

// Global database service instance
let globalDatabaseService: DatabaseService | null = null

export const useDatabaseService = (options: ModuleOptions): DatabaseService => {
    if (!globalDatabaseService) {
        globalDatabaseService = new DatabaseService(options)
    }
    return globalDatabaseService
}

export const getDatabaseService = (): DatabaseService | null => {
    return globalDatabaseService
} 