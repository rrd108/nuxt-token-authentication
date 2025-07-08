<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <FormKit
          type="form"
          v-model="formData"
          @submit="handleLogin"
          :actions="false"
          form-class="space-y-6"
        >
          <FormKit
            type="email"
            name="email"
            label="Email address"
            placeholder="you@example.com"
            validation="required|email"
            :input-class="'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'"
            :label-class="'block text-sm font-medium text-gray-700'"
            :message-class="'mt-2 text-sm text-red-600'"
          />

          <FormKit
            type="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            validation="required"
            :input-class="'appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'"
            :label-class="'block text-sm font-medium text-gray-700'"
            :message-class="'mt-2 text-sm text-red-600'"
          />

          <div v-if="errorMessage" class="mt-3 text-sm text-red-600">
            {{ errorMessage }}
          </div>

          <div>
            <FormKit
              type="submit"
              label="Sign in"
              :disabled="loading"
              :input-class="'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'"
            />
          </div>
        </FormKit>

        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            create an account
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app' // Nuxt 3 auto-import

const formData = ref({
  email: '',
  password: '',
})
const errorMessage = ref<string | null>(null)
const loading = ref(false)

// This should ideally be managed by a composable provided by the module, e.g., useAuth()
const userToken = useCookie<string | null>('auth_token')

async function handleLogin() {
  loading.value = true
  errorMessage.value = null
  try {
    // The $fetch utility is auto-imported in Nuxt 3
    const response = await $fetch<{ token: string; user: any; expires_at: string }>('/api/auth/login', {
      method: 'POST',
      body: formData.value,
    })

    if (response.token) {
      const expires = new Date(response.expires_at)
      userToken.value = response.token
      // The useCookie composable handles setting the cookie with options if provided
      // e.g., useCookie('auth_token', { expires: expires })

      await navigateTo('/')
    } else {
      errorMessage.value = 'Login failed: No token received.'
    }
  } catch (error: any) {
    if (error.data && error.data.statusMessage) {
      errorMessage.value = `Login failed: ${error.data.statusMessage}`
    } else if (error.message) {
      errorMessage.value = `Login failed: ${error.message}`
    } else {
      errorMessage.value = 'An unexpected error occurred during login.'
    }
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Minimal styling, assuming Tailwind handles most of it via :input-class */
</style>
