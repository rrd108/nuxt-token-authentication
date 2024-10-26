export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const data = await readBody(event)

  const options = useRuntimeConfig().public.nuxtTokenAuthentication

  // for table names we need and extra {} - see https://github.com/unjs/db0/issues/77

  const { rows } = await db.sql`
    SELECT * FROM {${options.authTable}} 
    WHERE email = ${data.email} AND password = ${data.password} 
    LIMIT 1
  `

  // TODO do not use plain password, use something like this
  /* const isPasswordValid = await bcrypt.compare(data.password, String(rows![0].password))
  if (!isPasswordValid) {
    throw createError({ status: 401, message: 'Hibás email vagy jelszó!' })
  } */

  if (rows?.length == 0) {
    throw createError({ status: 401, message: 'Unauthorized' })
  }

  const user = rows ? rows[0] : undefined
  if (user) {
    delete user.password
    // TODO generate new token
  }
  return { user }
})
