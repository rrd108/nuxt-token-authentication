export default defineNuxtConfig({
  modules: ['../src/module', '@formkit/nuxt', '@nuxtjs/tailwindcss'],
  nitro: {
    experimental: {
      database: true,
    },
  },
  nuxtTokenAuthentication: {
    // noAuthRoutes are now largely handled by the module itself if customUI.login is false.
    // We might still need to add custom ones, like /api/auth/register if we create it.
    // Or if the user wants to use a completely different login path not /auth/login.
    noAuthRoutes: ['/api/auth/register'], // Example: if we had a register endpoint
    // customUI: { login: true } // Set this if you want to provide your own login page/component and paths
  },
  formkit: {
    // Experimental support for auto loading (default true)
    autoImport: true,
  },
  devtools: { enabled: true },
})
