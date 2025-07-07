export interface User {
    id: number
    name: string
    email: string
    password: string
    email_verified_at?: string
    created_at: string
    updated_at: string
}

export interface PersonalAccessToken {
    id: number
    tokenable_type: string
    tokenable_id: number
    name: string
    token: string
    abilities?: string
    last_used_at?: string
    expires_at?: string
    created_at: string
    updated_at: string
}

export interface PasswordResetToken {
    id: number
    email: string
    token: string
    created_at: string
}

export interface MigrationRecord {
    id: number
    version: number
    name: string
    executed_at: string
}

// Database table names
export const TABLES = {
    USERS: 'users',
    PERSONAL_ACCESS_TOKENS: 'personal_access_tokens',
    PASSWORD_RESET_TOKENS: 'password_reset_tokens',
    MIGRATIONS: 'migrations',
} as const

// Token abilities (permissions)
export const TOKEN_ABILITIES = {
    'READ': 'read',
    'WRITE': 'write',
    'DELETE': 'delete',
    'ADMIN': 'admin',
    '*': '*',
} as const

export type TokenAbility = typeof TOKEN_ABILITIES[keyof typeof TOKEN_ABILITIES]

// Token types
export const TOKENABLE_TYPES = {
    USER: 'App\\Models\\User',
} as const

export type TokenableType = typeof TOKENABLE_TYPES[keyof typeof TOKENABLE_TYPES]

// Database indexes for performance
export const INDEXES = {
    USERS_EMAIL: 'idx_users_email',
    PERSONAL_ACCESS_TOKENS_TOKENABLE: 'idx_personal_access_tokens_tokenable',
    PERSONAL_ACCESS_TOKENS_TOKEN: 'idx_personal_access_tokens_token',
    PERSONAL_ACCESS_TOKENS_EXPIRES: 'idx_personal_access_tokens_expires',
    PASSWORD_RESET_TOKENS_EMAIL: 'idx_password_reset_tokens_email',
    PASSWORD_RESET_TOKENS_TOKEN: 'idx_password_reset_tokens_token',
} as const
