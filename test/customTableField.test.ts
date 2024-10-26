import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDatabase, dropTestDatabase } from './utils/testDatabase'

describe('middleware', async () => {
  let dbName: string
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/customTableField', import.meta.url)),
  })

  beforeEach(async () => {
    dbName = await createTestDatabase('customers', 'identifier') // from this test's nuxt.config.ts
  })

  afterEach(async () => {
    await dropTestDatabase(dbName, 'customers')
  })

  it('deny access with an invalid token', async () => {
    try {
      await $fetch('/api/users', {
        method: 'GET',
        headers: { token: 'invalidTestToken' },
      })
      expect(true).toBe(false)
    }
    catch (err) {
      const typedErr = err as { statusCode: number, statusMessage: string }
      expect(typedErr.statusCode).toBe(401)
      expect(typedErr.statusMessage).toBe('Authentication error')
    }
  })

  it('allow access with valid token', async () => {
    const response = await $fetch('/api/users', {
      method: 'GET',
      headers: { token: 'Gauranga%TestToken0123456789' },
    })
    expect((response as any).results[0].name).toBe('Gauranga')
  })
})
