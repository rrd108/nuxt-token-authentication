export default defineNuxtConfig({
  modules: ["../src/module"],
  nuxtTokenAuthentication: {
    noAuthRoutes: ["POST:/api/auth/getToken"],
  },
  devtools: { enabled: true },
});
