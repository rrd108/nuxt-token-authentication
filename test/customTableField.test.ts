import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('middleware', async () => {
  await setup({
    rootDir: fileURLToPath(
      new URL('./fixtures/customTableField', import.meta.url),
    ),
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
      headers: { token: '++Gauranga++Gauranga' },
    })
    expect((response as any).results[0].name).toBe('Gauranga')
  })
})
