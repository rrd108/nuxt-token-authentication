import {
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  addComponent,
  addImportsDir,
  extendPages
} from '@nuxt/kit'
import defu from 'defu'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'pathe'

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
  // Option to disable default pages/components
  customUI?: {
    login?: boolean // if true, module does not provide login page/component
  }
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
  noAuthRoutes: [], // Default to empty, user must configure
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
  customUI: {
    login: false,
  }
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
    const runtimeDir = resolver.resolve('./runtime')

    // Ensure noAuthRoutes always includes the module's own login if not disabled
    const allNoAuthRoutes = new Set(options.noAuthRoutes)
    if (!options.customUI?.login) {
      allNoAuthRoutes.add('/auth/login') // Path for the module's login page
      // also add the API endpoint
      allNoAuthRoutes.add('/api/auth/login') // Path for the module's login API
    }
    const uniqueNoAuthRoutes = Array.from(allNoAuthRoutes)


    nuxt.options.runtimeConfig.public.nuxtTokenAuthentication = defu(
      nuxt.options.runtimeConfig.public.nuxtTokenAuthentication,
      { ...options, noAuthRoutes: uniqueNoAuthRoutes } // Use the updated noAuthRoutes
    )

    addServerHandler({
      middleware: true,
      handler: resolver.resolve('./runtime/server/middleware/tokenAuth'),
    })

    // Add components
    if (!options.customUI?.login) {
      addComponent({
        name: 'AuthLoginForm', // Name of the component to be used in templates
        filePath: resolver.resolve('./runtime/components/AuthLoginForm.vue'),
        global: true, // Optional: makes it globally available without prefix
      })
    }

    // Add pages
    if (!options.customUI?.login) {
      extendPages((pages) => {
        pages.push({
          name: 'auth-login',
          path: '/auth/login', // URL path for the login page
          file: resolver.resolve('./runtime/pages/auth/login.vue'),
        })
      })
    }

    // Add auto-imports for composables, utils (if any)
    // addImportsDir(resolver.resolve(runtimeDir, 'composables'))
    // addImportsDir(resolver.resolve(runtimeDir, 'utils'))


    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
