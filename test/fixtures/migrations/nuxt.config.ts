import { defineNuxtConfig } from 'nuxt/config'
import NuxtTokenAuthentication from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtTokenAuthentication],
  nitro: {
    experimental: {
      database: true,
    },
  },
  nuxtTokenAuthentication: {
    noAuthRoutes: ['GET:/api/test-db'],
    connector: {
      name: 'sqlite',
      options: {
        path: './test/data/migrations.sqlite3',
      },
    },
  },
})
