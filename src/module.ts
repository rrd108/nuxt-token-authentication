import {
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import defu from 'defu'

// Module options TypeScript interface definition
export interface ModuleOptions {
  authTable?: string
  connector?: {
    name: 'mysql' | 'postgresql' | 'sqlite'
    options: Record<string, any>
  }
  noAuthRoutes: string[]
  prefix?: string
  tokenField?: string
  tokenHeader?: string
  // New Sanctum-like options
  tokenTable?: string
  tokenExpiration?: number // in seconds
  refreshTokenExpiration?: number
  tokenAbilities?: string[]
  rateLimiting?: {
    enabled: boolean
    maxAttempts: number
    decayMinutes: number
  }
  csrfProtection?: boolean
  sessionGuard?: 'token' | 'session' | 'both'
}

export const defaultOptions: ModuleOptions = {
  authTable: 'users',
  connector: {
    name: 'sqlite',
    options: {
      path: './data/db.sqlite3',
    },
  },
  tokenField: 'token',
  tokenHeader: 'Token',
  prefix: '',
  noAuthRoutes: [],
  // New Sanctum-like defaults
  tokenTable: 'personal_access_tokens',
  tokenExpiration: 60 * 60 * 24 * 365, // 1 year
  refreshTokenExpiration: 60 * 60 * 24 * 30, // 30 days
  tokenAbilities: ['*'],
  rateLimiting: {
    enabled: true,
    maxAttempts: 5,
    decayMinutes: 1,
  },
  csrfProtection: false,
  sessionGuard: 'token',
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-token-authentication',
    configKey: 'nuxtTokenAuthentication',
  },

  // Default configuration options of the Nuxt module
  defaults: defaultOptions,

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./runtime/server/middleware/tokenAuth'),
    })

    nuxt.options.runtimeConfig.public.nuxtTokenAuthentication = defu(
      nuxt.options.runtimeConfig.public.nuxtTokenAuthentication,
      options,
    )

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
