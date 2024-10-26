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
  },
})
