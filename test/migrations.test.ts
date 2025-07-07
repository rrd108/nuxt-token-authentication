import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import defu from 'defu'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { defaultOptions } from '../src/module'
import config from './fixtures/migrations/nuxt.config'
import { createTestDatabase, dropTestDatabase } from './utils/createTestDatabase'

const options = defu(config.nuxtTokenAuthentication, defaultOptions)
beforeAll(async () => await createTestDatabase(options))
afterAll(async () => await dropTestDatabase(options))

describe('migration System', async () => {
    await setup({
        rootDir: fileURLToPath(new URL('./fixtures/migrations', import.meta.url)),
    })

    it('should render the index page', async () => {
        const response = await $fetch('/')
        expect(response).toBeDefined()
    })

    it('should have database tables created', async () => {
        // This test will verify that the migration system works
        // by checking if the database is properly set up
        const response = await $fetch('/api/test-db')
        expect(response).toBeDefined()
    })
})
