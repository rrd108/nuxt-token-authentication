<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#app'

// This is a simplified auth state. In a real app, use Pinia/Vuex or a dedicated composable.
const userToken = useCookie<string | null>('auth_token')
const isAuthenticated = computed(() => !!userToken.value)

async function logout() {
  userToken.value = null // Clear the cookie
  await navigateTo('/auth/login') // Updated path
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="font-bold text-xl text-indigo-600">Auth Playground</NuxtLink>
          </div>
          <div class="flex items-center">
            <NuxtLink v-if="!isAuthenticated" to="/auth/login" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Login</NuxtLink>
            <NuxtLink v-if="!isAuthenticated" to="/register" class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Register (Module)</NuxtLink>
            <button v-if="isAuthenticated" @click="logout" class="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- NuxtPage will render the current page based on the route -->
        <NuxtPage />

        <!-- Fallback content for the root path when not authenticated and no specific page matches -->
        <div v-if="!isAuthenticated && $route.path === '/'">
          <div class="text-center mt-10 bg-white p-8 rounded-lg shadow">
            <h1 class="text-3xl font-bold text-gray-800">Welcome to the Auth Playground</h1>
            <p class="mt-4 text-lg text-gray-600">
              This is the main entry point. Please
              <NuxtLink to="/auth/login" class="text-indigo-600 hover:underline">login</NuxtLink>
              or
              <NuxtLink to="/register" class="text-indigo-600 hover:underline">register</NuxtLink>
              to continue.
            </p>
            <p class="mt-2 text-sm text-gray-500">
              (Currently, the login form is available, register is a placeholder.)
            </p>
          </div>
        </div>

        <!-- Displayed when authenticated on the root path -->
        <div v-if="isAuthenticated && $route.path === '/'">
            <div class="bg-white p-8 rounded-lg shadow">
                <h1 class="text-2xl font-semibold text-gray-900">Welcome Back!</h1>
                <p class="mt-2 text-gray-700">You are logged in.</p>
                <p class="mt-4">Your Token: <code class="text-sm bg-gray-200 p-1 rounded break-all">{{ userToken }}</code></p>
            </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style>
/* Using a common sans-serif stack for now */
body {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  background-color: #f9fafb; /* bg-gray-50 */
}
</style>
