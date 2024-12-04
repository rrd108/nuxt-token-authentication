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
    noAuthRoutes: ['GET:/api/route_noauth', 'GET:/api/orders/[id]'],
    connector: {
      name: 'sqlite',
      options: {
        path: './test/data/basic.sqlite3',
      },
    },
  },
})
