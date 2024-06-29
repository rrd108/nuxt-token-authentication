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
    //authTable: "users", // users table name, default: "users"
    //tokenField: "token",  // name of the field in your table that stores the token, default: "token"
    //tokenHeader: "Token", // name of the authentication header, you can use or "Authorization", or anything else you want, default: "Token"
    // prefix: "Bearer" // value used to prefix the token's value, default is empty
    noAuthRoutes: ["POST:/api/auth/getToken"], // list of routes that do not require authentication
  },
});
```

## Creating the API endpoints

Let's suppose you want to authenticate the users at the url `api/auth/getToken` with a `POST` request. You can use the following code to create the API endpoint.

Create a file at `/server/api/auth/getToken.post.ts` with the following code. Feel free to modify if your users table does not identify the users by their email and password but other fields.
Do not forget to change `data.password` (coming from the user's request) to a **hashed password**.

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const data = await readBody(event);

  const options = useRuntimeConfig().public.nuxtTokenAuthentication;
  const user = await prisma[options.authTable].findUnique({
    where: {
      email: data.email,
      password: data.password,
    },
  });

  delete user?.password;
  return { user };
});
```

Now you can send a `POST` request to `/api/auth/getToken` with 2 fields in the body: `email` and `password`. If the user exists, the server will return the user's data, including the token.
Any other routes (except the ones you set in `noAuthRoutes`) will require the token to be sent in the header.

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

## Testing

Test data should be at `/.data/db.sqlite3`

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-token-authentication/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-token-authentication
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-token-authentication.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-token-authentication
[license-src]: https://img.shields.io/npm/l/nuxt-token-authentication.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-token-authentication
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
