import { seedTestUser } from '../utils/seed-user'

export default defineNitroPlugin(async (nitroApp) => {
  if (process.dev) {
    console.log('Development mode: attempting to seed test user...')
    try {
      // Ensure migrations run first if possible.
      // This might be tricky to coordinate perfectly from a Nitro plugin
      // without a dedicated migration runner hook before plugins.
      // For db0, migrations are often run at build time or on startup.
      // Let's assume migrations are handled by the module or manually for now.
      await seedTestUser()
    } catch (error) {
      console.error('Failed to seed test user during startup:', error)
    }
  }
})
