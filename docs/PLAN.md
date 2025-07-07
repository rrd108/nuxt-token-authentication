# Planned features

## Phase 1: Core Auth Features

### 1. Token Management System

Token Generation: Secure random token generation with proper hashing
Token Storage: Separate tokens table with user relationships
Token Expiration: Configurable token lifetime with automatic cleanup
Token Abilities/Scopes: Permission-based token capabilities

### 2. Authentication Endpoints

Login: /api/auth/login - Email/password authentication
Logout: /api/auth/logout - Token revocation
User: /api/auth/user - Get current authenticated user
Refresh: /api/auth/refresh - Token refresh mechanism
Register: /api/auth/register - User registration

### 3. Session Management

User State: Global user state management
Session Persistence: Automatic session restoration
Multi-device Support: Multiple active sessions per user

## Phase 2: Advanced Features

### 4. Security Enhancements

Rate Limiting: Built-in rate limiting for auth endpoints
CSRF Protection: CSRF token validation for web routes
Token Rotation: Automatic token rotation on refresh
Device Fingerprinting: Track and manage device sessions

### 5. Database Schema Improvements

```sql
-- Users table (existing)
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Personal access tokens table (new)
CREATE TABLE personal_access_tokens (
  id INTEGER PRIMARY KEY,
  tokenable_type TEXT,
  tokenable_id INTEGER,
  name TEXT,
  token TEXT UNIQUE,
  abilities TEXT,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Phase 3: Developer Experience

### 6. Composables & Utilities

useAuth(): Main authentication composable
useUser(): User state management
useToken(): Token management utilities
authMiddleware(): Route middleware helper

### 7. Configuration Enhancements

```ts
interface ModuleOptions {
  // Existing options
  authTable?: string;
  connector?: DatabaseConnector;
  noAuthRoutes: string[];
  prefix?: string;
  tokenField?: string;
  tokenHeader?: string;

  // New Sanctum-like options
  tokenTable?: string;
  tokenExpiration?: number; // in seconds
  refreshTokenExpiration?: number;
  tokenAbilities?: string[];
  rateLimiting?: {
    enabled: boolean;
    maxAttempts: number;
    decayMinutes: number;
  };
  csrfProtection?: boolean;
  sessionGuard?: "token" | "session" | "both";
}
```

## Implementation Plan

### Step 1: Database Schema & Migration System

Create migration system for token table
Implement database schema updates
Add token management utilities

### Step 2: Core Authentication Services

Token generation and validation service
User authentication service
Session management service

### Step 3: API Endpoints

Implement all authentication endpoints
Add proper error handling and validation
Implement rate limiting

### Step 4: Frontend Integration

Create authentication composables
Add route middleware helpers
Implement automatic token refresh

### Step 5: Security & Testing

Add comprehensive security measures
Implement thorough testing suite
Add documentation and examples
