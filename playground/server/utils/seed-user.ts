import bcrypt from 'bcrypt'
import { useDatabase } from '#imports' // Assuming db0 is auto-imported

export async function seedTestUser() {
  const db = useDatabase()
  const options = useRuntimeConfig().public.nuxtTokenAuthentication

  const email = 'test@example.com'
  const plainPassword = 'password123'
  const name = 'Test User'

  // Check if user already exists
  try {
    const { rows } = await db.sql`
      SELECT id FROM {${options.authTable}} WHERE email = ${email}
    `
    if (rows && rows.length > 0) {
      console.log(`User ${email} already exists. Skipping seed.`)
      // Optionally, update the existing user's password if needed for testing
      // const saltRounds = 10
      // const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
      // await db.sql`UPDATE {${options.authTable}} SET password = ${hashedPassword} WHERE email = ${email}`
      // console.log(`Updated password for ${email}.`)
      return
    }
  } catch (error) {
    // If table doesn't exist yet, migrations will handle it.
    // This seed script should ideally run after migrations.
    console.warn('Could not check for existing user, possibly table does not exist yet.', error.message)
  }


  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)

  try {
    // Ensure migrations have run and table exists
    // Attempt to create the users table directly if it doesn't exist
    // This is a simplified approach for playground; in production, rely on migration runner
    await db.sql`
      CREATE TABLE IF NOT EXISTS {${options.authTable}} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email_verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    await db.sql`CREATE INDEX IF NOT EXISTS idx_users_email ON {${options.authTable}}(email)`


    await db.sql`
      INSERT INTO {${options.authTable}} (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `
    console.log(`Successfully seeded user: ${email} with password: ${plainPassword}`)
  } catch (error) {
    console.error('Error seeding user:', error)
    console.error('Please ensure migrations have run successfully before seeding.')
  }
}

// You might want to call this automatically on server startup for the playground,
// or expose it as an endpoint, or run it via a CLI command.
// For now, it can be manually imported and run in a server route or plugin if needed.

// Example of how to run it on startup (e.g. in a server plugin or the main module.ts for playground)
// (async () => {
//   if (process.env.NODE_ENV === 'development') {
//     await seedTestUser();
//   }
// })();
