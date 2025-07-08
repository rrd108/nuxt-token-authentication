<template>
  <div>
    <!-- This will resolve to src/runtime/components/AuthLoginForm.vue by default -->
    <!-- Or a user's components/AuthLoginForm.vue if they override it -->
    <AuthLoginForm />
  </div>
</template>

<script setup lang="ts">
// This page is provided by the module.
// Users can override this by creating their own pages/auth/login.vue

// Define page meta for unauthenticated access.
// The actual `auth` property might be specific to an auth middleware solution.
// For this module, it's more about `noAuthRoutes` in the config.
definePageMeta({
  layout: 'auth-layout', // Example: if the module provides an auth-specific layout
  // auth: false // This is more for a global auth middleware not defined by this module itself.
})

// Log to indicate which login page is being used
if (process.client) {
  console.log('Using module-provided login page: src/runtime/pages/auth/login.vue');
}
</script>

<style scoped>
/* Styles specific to the module's login page container */
</style>
