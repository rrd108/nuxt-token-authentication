# Nuxt Token Authentication (Enhanced with Sanctum-like Features)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

This Nuxt module provides robust token-based authentication, inspired by Laravel Sanctum, for your Nuxt 3 applications. It simplifies user authentication using database-backed tokens and offers optional, customizable UI components for login.

## Features

- **Sanctum-like Token System:** Uses `personal_access_tokens` table for persistent API tokens.
- **Flexible Database Support:** Leverages `db0` for compatibility with various database backends (MySQL, PostgreSQL, SQLite, etc.).
- **Built-in Login API:** Provides a default `/api/auth/login` endpoint.
- **Optional Frontend UI:** Includes a default, Tailwind CSS styled login page (`/auth/login`) and form component (`<AuthLoginForm />`) using FormKit.
- **Customizable & Overridable:**
    - Configure token names, expiration, and tables.
    - Easily disable or override default UI components and API routes.
    - Define routes exempt from authentication.
- **Secure by Default:** Password hashing with bcrypt for login endpoint, server-side token validation.
- **Streamlined Integration:** Easy setup with minimal configuration.
- **Automatic Token Handling:** Client-side plugin to attach tokens to API requests and server-side middleware to protect routes.

## Quick Setup

### 1. Add `nuxt-token-authentication` dependency to your project

```bash
# Using pnpm
pnpm add nuxt-token-authentication @formkit/nuxt @nuxtjs/tailwindcss bcrypt
# Using yarn
yarn add nuxt-token-authentication @formkit/nuxt @nuxtjs/tailwindcss bcrypt
# Using npm
npm install nuxt-token-authentication @formkit/nuxt @nuxtjs/tailwindcss bcrypt
```
*(FormKit, TailwindCSS and bcrypt are peer dependencies if using the default UI and login endpoint).*

### 2. Add modules to `nuxt.config.ts` and configure

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'nuxt-token-authentication',
    '@formkit/nuxt', // Required if using default login form
    '@nuxtjs/tailwindcss', // Required if using default login form styling
  ],

  nitro: {
    // Ensure experimental database feature is enabled for db0
    experimental: {
      database: true,
    },
    // Define your database connection (used by the module)
    database: {
      default: {
        connector: 'sqlite', // Example: 'mysql', 'postgresql'
        options: {
          path: './data/db.sqlite3', // Example for SQLite
          // Add other connector options as needed (host, port, user, password, database)
        },
      },
    },
  },

  nuxtTokenAuthentication: {
    // Core settings (already have sensible defaults)
    // authTable: 'users',                // User table name
    // tokenTable: 'personal_access_tokens', // Table for storing tokens
    // tokenExpiration: 31536000,         // Token expiration in seconds (default: 1 year)

    // HTTP Header for token (defaults to 'Authorization' with 'Bearer' prefix)
    // tokenHeader: 'Authorization',      // Header name
    // prefix: 'Bearer',                  // Token prefix (set to empty string if not using a prefix)

    // Customize which routes are public (module adds its own login API & page by default)
    // noAuthRoutes: ['/api/public-route', '/api/auth/register'],

    // UI Customization
    customUI: {
      // login: true, // Set to true to disable the default /auth/login page and AuthLoginForm component
    },

    // Database connector options (if not using nitro.database.default)
    // connector: {
    //   name: 'sqlite',
    //   options: { path: './data/mydb.sqlite3' }
    // }
  },

  // Optional: FormKit configuration (if using default UI)
  // formkit: {
  //   autoImport: true,
  // },
});
```

**Important:** Ensure you have the appropriate database driver installed (e.g., `better-sqlite3`, `mysql2`, `pg`). Refer to [db0.unjs.io](https://db0.unjs.io/connectors) for more details. The module will run migrations to create necessary tables (`users`, `personal_access_tokens`, `migrations`) if they don't exist.

## Login Functionality

### Backend API (`/api/auth/login`)
The module provides a default `POST /api/auth/login` endpoint. It expects an `email` and `password` in the request body.
- On success, it returns `{ token, user, expires_at }`.
- It uses `bcrypt` to compare passwords. Ensure your user registration process hashes passwords with `bcrypt`.
- This endpoint is automatically added to `noAuthRoutes`.

### Frontend UI (Login Page & Component)
If `customUI.login` is `false` (default), the module provides:
- A login page at `/auth/login`.
- An `<AuthLoginForm />` component used by this page. It's styled with Tailwind CSS and uses FormKit.

**Using the Default Login Page:**
Simply navigate users to `/auth/login`.

**Using the Login Form Component Manually:**
If you disable the default page (`customUI: { login: true }`) but still want to use the form component:
```vue
<template>
  <div>
    <h1>My Custom Login Page</h1>
    <AuthLoginForm />
  </div>
</template>

<script setup lang="ts">
// AuthLoginForm will be auto-imported if customUI.login is false,
// or if you manually ensure components from the module are scanned.
// If customUI.login is true, you might need to handle its availability or create your own.
</script>
```

### Customizing or Disabling Default UI
- **Disable all default login UI:** Set `nuxtTokenAuthentication: { customUI: { login: true } }`. You will then need to create your own login API endpoint, page, and form component.
- **Override Components/Pages:** Nuxt 3's layering system allows you to override the module's components or pages by creating files with the same name in your project's `components/` or `pages/` directory. For example, to override the login form, create `~/components/AuthLoginForm.vue`. To override the page, create `~/pages/auth/login.vue`.

## Access Token Handling

- **Client-Side:** The `AuthLoginForm` (and your custom forms should do similarly) stores the received token in a cookie named `auth_token`. A client-side plugin automatically attaches this token as a `Bearer` token in the `Authorization` header (or the custom `tokenHeader`) for same-origin API requests that are not in `noAuthRoutes`.
- **Server-Side:** A server middleware validates this token for protected API routes. If valid, user information is attached to `event.context.auth.user`.

## Protecting API Routes
All API routes (typically under `/api/`) are protected by default, except those listed in `noAuthRoutes`. The server middleware will return a `401 Unauthorized` error if a valid token is not provided for a protected route.

Example of accessing the user in a protected API route:
```ts
// server/api/me.get.ts
export default defineEventHandler(async (event) => {
  // event.context.auth.user will be populated if the request is authenticated
  const user = event.context.auth?.user;

  if (!user) {
    // This should ideally not happen if middleware is working, but good for safety
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  return { user };
});
```

## Protecting Pages (Client-Side Routing)

You can protect pages using Nuxt route middleware. Check for the presence of the `auth_token` cookie.

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side for initial load, or handle appropriately
  if (process.server) return;

  const authToken = useCookie('auth_token');

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/register']; // Add other public page routes

  if (!authToken.value && !publicRoutes.includes(to.path)) {
    console.log('User not authenticated, redirecting to login.');
    return navigateTo('/auth/login'); // Or your custom login path
  }
});
```
Then apply this middleware to specific pages or layouts.
```vue
// pages/dashboard.vue
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});
</script>
```

## Development

```bash
# Install dependencies
yarn

# Generate type stubs
yarn dev:prepare

# Develop with the playground
yarn dev

# Build the playground
yarn dev:build

# Run ESLint
yarn lint

# Run Vitest
yarn test
yarn test:watch

# Release new version
yarn release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-token-authentication/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-token-authentication
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-token-authentication.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-token-authentication
[license-src]: https://img.shields.io/npm/l/nuxt-token-authentication.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-token-authentication
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
