export default defineNuxtConfig({
  modules: ["../src/module"],
  nitro: {
    experimental: {
      database: true,
    },
  },
  nuxtTokenAuthentication: {
    noAuthRoutes: ["POST:/api/auth/getToken"],
  },
  devtools: { enabled: true },
});
