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
    noAuthRoutes: ['GET:/api/route_noauth'],
    tokenHeader: 'Authorization',
    prefix: 'Bearer',
    connector: {
      name: 'sqlite',
      options: {
        path: './test/data/bearer.sqlite3',
      },
    },
  },
})
