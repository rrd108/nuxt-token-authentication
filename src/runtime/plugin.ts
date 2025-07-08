import { defineNuxtPlugin, useCookie, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const token = useCookie<string | null>('auth_token')
  const config = useRuntimeConfig().public.nuxtTokenAuthentication

  // Helper to check if a path is an API path that needs auth
  const isApiPath = (path: string): boolean => {
    if (!path.startsWith('/api/')) { // Assuming all internal API calls are under /api/
        return false
    }
    // Check against noAuthRoutes
    if (config.noAuthRoutes && config.noAuthRoutes.some((noAuthPath: string) => path.startsWith(noAuthPath))) {
        return false // It's an API path but it's exempt from auth
    }
    return true
  }

  nuxtApp.hook('app:created', () => {
    // This hook runs after the app is created, good place for $fetch defaults
    // However, $fetch is globally available, we can augment its defaults
    // Nuxt 3's $fetch automatically handles cookies on the server-side for same-domain requests.
    // For client-side, we need to attach the header if it's an API call.
  })


  // We need to augment the global $fetch instance
  // The recommended way for Nuxt 3 is to use ofetch hooks if available,
  // or wrap $fetch if direct augmentation is complex.
  // For now, let's show how one might add it for client-side initiated $fetch calls.
  // Note: $fetch used server-side during SSR will automatically forward cookies.

  // This part is primarily for client-side $fetch.
  // For server-side $fetch in API routes or server plugins, cookie forwarding should handle it.
  if (process.client) {
    const originalFetch = globalThis.$fetch;
    globalThis.$fetch = (request, options, ...args) => {
      let resolvedOptions = options || {};
      const url = typeof request === 'string' ? request : request.url;

      if (token.value && typeof url === 'string' && isApiPath(url)) {
        resolvedOptions.headers = {
          ...resolvedOptions.headers,
          'Authorization': `Bearer ${token.value}`,
        };
        // Add custom token header if specified in options
        if (config.tokenHeader && config.tokenHeader !== 'Authorization') {
            resolvedOptions.headers[config.tokenHeader] = token.value;
        }
      }
      return originalFetch(request, resolvedOptions, ...args);
    }
  }

  // Provide a helper if needed, e.g., for manual fetch calls or other libraries
  // nuxtApp.provide('authFetch', (url, options) => { ... })
})
