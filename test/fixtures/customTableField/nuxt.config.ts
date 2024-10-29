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
    authTable: 'customers',
    tokenField: 'identifier',
    noAuthRoutes: ['GET:/api/route_noauth'],
    connector: {
      name: 'sqlite',
      options: {
        path: './test/data/customTableField.sqlite3',
      },
    },
  },
})
