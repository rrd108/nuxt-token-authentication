# Nuxt Token Authentication

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

This Nuxt module simplifies user authentication using HTTP headers, streamlining the integration of token-based authorization into your application.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-token-authentication?file=playground%2Fapp.vue) -->
- [📖 &nbsp;Documentation](https://github.com/rrd108/nuxt-token-authentication)

## Features

- **Flexible Authentication:** Supports various database backends (MySQL, SQLite, MongoDB, Microsoft SQL Server, PlanetScale, CockroachDB, Supabase, Neon, Turso) for user and token management.
- **Customizable Token Handling:** You can configure the token header and the routes that do not require authentication.
- **Streamlined Integration:** Easy setup with minimal configuration.
- **Seamless error handling** for authentication failures.
- **Production-Ready:** Secure practices for handling sensitive token data.

## Quick Setup

### 1. Add `nuxt-token-authentication` dependency to your project

```bash
# Using pnpm
pnpm add nuxt-token-authentication

# Using yarn
yarn add nuxt-token-authentication

# Using npm
npm install nuxt-token-authentication
```

### 2. Add `nuxt-token-authentication` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ["nuxt-token-authentication"],
  nuxtTokenAuthentication: {
    tokenHeader: "Token", // or "Authorization", or anything else you use for the header
    // prefix: "Bearer"
    noAuthRoutes: ["POST:/api/auth/getToken"], // list of routes that do not require authentication
  },
});
```

### 3. Set Prisma schema

The module will install Prisma for you. You can use the following steps to set up Prisma. We assume you have an existing database, with at least one table to store the users, and the table has a column for the token, named `token`.

3.1. `npx prisma init` to create a new Prisma schema file. It will create a new directory called `prisma` with a `schema.prisma` file inside it.

3.2. In your `/.env` file, set the `DATABASE_URL` environment variable to point to your existing database. If your database has no tables yet, read [Getting Started with Prisma](https://pris.ly/d/getting-started).

Supported databases: PostgreSQL, MySQL, SQLite, MongoDB, Microsoft SQL Server, PlanetScale, CockroachDB, Supabase, Neon, Turso

```env
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

3.3. Set the provider of the datasource block in `schema.prisma` to match your database.

3.4. Run `npx prisma db pull` to turn your database schema into a Prisma schema.

3.5. Run `npx prisma generate` to generate the Prisma Client. You can then start querying your database.

That's it! You can now use Nuxt Token Authentication in your Nuxt app ✨

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

# Set up for testing
npx prisma db push
npx prisma db seed
# and create .env files for the test folders with DATABASE_URL="file:/fullPath/prisma/dev.db"


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
