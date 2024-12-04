# Nuxt Token Authentication

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

This Nuxt module simplifies user authentication using HTTP headers, streamlining the integration of token-based authorization into your application.

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

### 2. Add `nuxt-token-authentication` to `modules` and set up your database

```ts
const defaultDatabase = {
  // add your connector and it's options here
  connector: "sqlite" as const,
  options: {
    path: "./data/users.sqlite3",
  },
};

export default defineNuxtConfig({
  modules: ["nuxt-token-authentication"],
  nitro: {
    // should be switched on
    experimental: {
      database: true,
    },
    database: {
      default: defaultDatabase,
    },
  },
  nuxtTokenAuthentication: {
    //authTable: 'users',   // users table name, default: 'users'
    //tokenField: 'token',  // name of the field in your table that stores the token, default: 'token'
    //tokenHeader: 'Token', // name of the authentication header, you can use or 'Authorization', or anything else you want, default: 'Token'
    // prefix: 'Bearer'     // value used to prefix the token's value, default is empty
    connector: {
      name: defaultDatabase.connector,
      options: defaultDatabase.options,
    },
    noAuthRoutes: ["POST:/api/auth/getToken", "GET:/api/orders/[id]"], // list of routes that do not require authentication, query params ignored automatically
  },
});
```

### 3. Install a database connector

The complete list of supported database connectors is available at [db0.unjs.io](https://db0.unjs.io/connectors).
The module supports PostgreSQL, and SQLite. If you need another connector open an issue.

## Creating the API endpoints

Let's suppose you want to authenticate the users at the url `api/auth/getToken` with a `POST` request. You can use the following code to create the API endpoint.

Create a file at `/server/api/auth/getToken.post.ts` with the following code. Feel free to modify if your users table does not identify the users by their email and password but other fields.
Do not forget to change `data.password` (coming from the user's request) to a **hashed password**.

```ts
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  const db = useDatabase();
  const data = await readBody(event);

  const options = useRuntimeConfig().public.nuxtTokenAuthentication;

  // for table names we need and extra {} - see https://github.com/unjs/db0/issues/77
  const { rows } = await db.sql`
    SELECT * FROM {${options.authTable}}
    WHERE email = ${data.email}
    LIMIT 1`;

  const isPasswordValid = await bcrypt.compare(
    data.password,
    String(rows![0].password)
  );
  if (!isPasswordValid) {
    throw createError({
      status: 401,
      message: "Username or password is incorrect!",
    });
  }

  const user = rows ? rows[0] : undefined;
  if (user) {
    delete user.password;
    // TODO you can generate a new token here on every login
  }
  return { user };
});
```

Now you can send a `POST` request to `/api/auth/getToken` with 2 fields in the body: `email` and `password`. If the user exists, the server will return the user's data, including the token, so you can store it in your local state or pinia store.
Any other routes (except the ones you set in `noAuthRoutes`) will require the token to be sent in the header.

> Do not forget to save the token in the local state or pinia store.

## Implementing Route Access Control

You can limit access to routes by adding a middleware. For example, the following code will redirect to `/admin/login` if the user is not logged in and the route starts with `/admin`.

```ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState("user");
  if (!user.value?.token && to.path.startsWith("/admin")) {
    console.log("redirecting to login as user is not logged in");
    return navigateTo("/admin/login");
  }
});
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
