# Database Schema & Migration System

This document describes the database schema and migration system for the Nuxt Token Authentication module, designed to be Laravel Sanctum-like.

## Overview

The module uses a migration-based approach to manage database schema changes. This ensures that your database structure is version-controlled and can be easily deployed across different environments.

## Database Tables

### 1. Users Table (`users`)

The main users table stores user account information:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

- `id`: Primary key, auto-incrementing
- `name`: User's display name
- `email`: Unique email address
- `password`: Hashed password (using bcrypt)
- `email_verified_at`: Timestamp when email was verified
- `created_at`: Record creation timestamp
- `updated_at`: Record last update timestamp

**Indexes:**

- `idx_users_email`: Index on email for fast lookups

### 2. Personal Access Tokens Table (`personal_access_tokens`)

This table stores API tokens for authentication, similar to Laravel Sanctum:

```sql
CREATE TABLE personal_access_tokens (
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
);
```

**Columns:**

- `id`: Primary key, auto-incrementing
- `tokenable_type`: Type of the token owner (e.g., 'App\\Models\\User')
- `tokenable_id`: ID of the token owner
- `name`: Human-readable name for the token
- `token`: Unique token hash
- `abilities`: JSON string of token permissions
- `last_used_at`: Last time the token was used
- `expires_at`: Token expiration timestamp
- `created_at`: Token creation timestamp
- `updated_at`: Token last update timestamp

**Indexes:**

- `idx_personal_access_tokens_tokenable`: Composite index on tokenable_type and tokenable_id
- `idx_personal_access_tokens_token`: Index on token for fast lookups
- `idx_personal_access_tokens_expires`: Index on expires_at for cleanup queries

### 3. Password Reset Tokens Table (`password_reset_tokens`)

Stores temporary tokens for password reset functionality:

```sql
CREATE TABLE password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

- `id`: Primary key, auto-incrementing
- `email`: Email address requesting password reset
- `token`: Unique reset token
- `created_at`: Token creation timestamp

**Indexes:**

- `idx_password_reset_tokens_email`: Index on email
- `idx_password_reset_tokens_token`: Index on token

### 4. Migrations Table (`migrations`)

Tracks which migrations have been executed:

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

- `id`: Primary key, auto-incrementing
- `version`: Migration version number
- `name`: Migration name
- `executed_at`: When the migration was executed

## Migration System

### Available Migrations

1. **create_migrations_table** (v2)

   - Creates the migrations tracking table

2. **create_personal_access_tokens_table** (v1)

   - Creates the personal access tokens table with indexes

3. **update_users_table** (v3)

   - Creates or updates the users table with proper structure
   - Adds missing columns if table already exists

4. **create_password_reset_tokens_table** (v4)
   - Creates the password reset tokens table with indexes

### Running Migrations

#### Using the CLI

```bash
# Run all pending migrations
npx nuxt-token-authentication migrate up

# Check migration status
npx nuxt-token-authentication migrate status

# Rollback last migration
npx nuxt-token-authentication migrate rollback

# Rollback multiple migrations
npx nuxt-token-authentication migrate rollback 3
```

#### Programmatically

```typescript
import { useDatabaseService } from "nuxt-token-authentication/server/database";

const dbService = useDatabaseService(options);

// Run migrations
await dbService.runMigrations();

// Check status
const status = await dbService.getMigrationStatus();

// Rollback
await dbService.rollbackMigrations(1);
```

### Migration Lifecycle

1. **Development**: Create new migration files in `src/runtime/server/database/migrations/`
2. **Testing**: Run migrations in test environment
3. **Production**: Run migrations during deployment
4. **Rollback**: Use rollback commands if needed

## Token Abilities

Tokens can have specific abilities (permissions) defined as JSON strings:

```typescript
// Example abilities
const abilities = ["read", "write", "delete"];
const adminAbilities = ["*"]; // All permissions
const readOnlyAbilities = ["read"];
```

## Security Considerations

1. **Token Hashing**: All tokens are stored as hashed values
2. **Expiration**: Tokens can have expiration dates
3. **Abilities**: Fine-grained permission control
4. **Cleanup**: Expired tokens are automatically cleaned up
5. **Rate Limiting**: Built-in rate limiting for auth endpoints

## Database Connectors

The module supports multiple database connectors:

- **SQLite**: Default, file-based database
- **MySQL**: Production-ready relational database
- **PostgreSQL**: Advanced relational database

### Configuration Example

```typescript
export default defineNuxtConfig({
  nuxtTokenAuthentication: {
    connector: {
      name: "sqlite", // or 'mysql', 'postgresql'
      options: {
        path: "./data/db.sqlite3", // SQLite
        // host: 'localhost', // MySQL/PostgreSQL
        // port: 3306, // MySQL/PostgreSQL
        // database: 'myapp', // MySQL/PostgreSQL
        // username: 'user', // MySQL/PostgreSQL
        // password: 'password', // MySQL/PostgreSQL
      },
    },
  },
});
```

## Best Practices

1. **Always run migrations** before starting your application
2. **Backup your database** before running migrations in production
3. **Test migrations** in a staging environment first
4. **Use meaningful migration names** for better tracking
5. **Keep migrations small** and focused on single changes
6. **Version control** your migration files

## Troubleshooting

### Common Issues

1. **Migration already exists**: Check the migrations table for conflicts
2. **Database locked**: Ensure no other processes are using the database
3. **Permission denied**: Check file/directory permissions for SQLite
4. **Connection failed**: Verify database connection settings

### Debugging

Enable debug logging to see detailed migration information:

```typescript
// In your Nuxt config
export default defineNuxtConfig({
  nuxtTokenAuthentication: {
    debug: true, // Enable debug logging
  },
});
```

## Next Steps

After setting up the database schema, you can:

1. Create authentication endpoints
2. Implement token generation and validation
3. Add user management features
4. Set up password reset functionality
5. Configure rate limiting and security features
