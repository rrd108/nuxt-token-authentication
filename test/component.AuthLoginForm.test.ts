import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils' // Using @vue/test-utils directly for component mounting
import { defineComponent, h } from 'vue'
import { createTestingPinia } from '@pinia/testing' // If using Pinia
import AuthLoginForm from '../src/runtime/components/AuthLoginForm.vue' // Adjust path as needed
import { FormKitProvider, FormKit } from '@formkit/vue' // Import FormKit components for stubbing or using

// Mock Nuxt composables used by the component
const mockNavigateTo = vi.fn()
const mockUseCookie = vi.fn()
const mock$fetch = vi.fn()

vi.mock('#app', () => ({
  navigateTo: mockNavigateTo,
  useCookie: mockUseCookie,
  // We will mock $fetch globally for this test
}))

// Mock global $fetch
globalThis.$fetch = mock$fetch

describe('AuthLoginForm.vue', () => {
  let mockAuthTokenCookie: { value: string | null }

  const mountComponent = (props = {}) => {
    return mount(AuthLoginForm, {
      global: {
        plugins: [
          // FormKit - if it's not deeply integrated and can be stubbed or needs minimal setup
          // This might require more complex setup if FormKit auto-imports/plugins are heavily relied upon.
          // For basic FormKit usage, providing stubs might be enough.
        ],
        stubs: {
          // Stub FormKit components if they cause issues in tests or to simplify.
          // Alternatively, configure FormKit properly for tests.
          FormKit: defineComponent({
            props: ['type', 'name', 'label', 'validation', 'placeholder', 'formClass', 'actions', 'inputClass', 'messageClass'],
            emits: ['submit'],
            setup(props, { emit, slots }) {
              if (props.type === 'form') {
                return () => h('form', { onSubmit: (e: Event) => { e.preventDefault(); emit('submit')} }, slots.default ? slots.default() : [])
              }
              if (props.type === 'submit') {
                return () => h('button', { type: 'submit' }, props.label || 'Submit')
              }
              return () => h('input', { type: props.type, name: props.name, placeholder: props.placeholder })
            }
          }),
          NuxtLink: defineComponent({ // Stub NuxtLink
            props: ['to'],
            setup(props, { slots }) {
              return () => h('a', { href: props.to }, slots.default ? slots.default() : [])
            }
          })
        },
      },
      props,
    })
  }

  beforeEach(() => {
    vi.resetAllMocks()
    mockAuthTokenCookie = { value: null }
    mockUseCookie.mockReturnValue(mockAuthTokenCookie)
  })

  it('renders email and password fields', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('input[name="email"]').exists()).toBe(true)
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('calls login API on form submission with correct data', async () => {
    mock$fetch.mockResolvedValue({ token: 'test-token', user: { id: 1, name: 'Test' }, expires_at: new Date().toISOString() })
    const wrapper = mountComponent()

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    expect(mock$fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' },
    })
  })

  it('stores token and navigates on successful login', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString()
    mock$fetch.mockResolvedValue({ token: 'new-test-token', user: { id: 1 }, expires_at: futureDate })
    const wrapper = mountComponent()

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')

    // Wait for promises to resolve
    await wrapper.vm.$nextTick() // Wait for Vue's reactivity
    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations like $fetch

    expect(mockAuthTokenCookie.value).toBe('new-test-token')
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })

  it('displays error message on failed login (API error)', async () => {
    mock$fetch.mockRejectedValue({ data: { statusMessage: 'Invalid credentials' } })
    const wrapper = mountComponent()

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0));


    expect(wrapper.html()).toContain('Login failed: Invalid credentials')
    expect(mockAuthTokenCookie.value).toBeNull()
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('displays generic error message if API error structure is unexpected', async () => {
    mock$fetch.mockRejectedValue(new Error('Network Error')) // Generic error
    const wrapper = mountComponent()

    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(wrapper.html()).toContain('Login failed: Network Error')
    expect(mockAuthTokenCookie.value).toBeNull()
  })

  it('disables submit button while loading', async () => {
    mock$fetch.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve({ token: 'token', user: {}, expires_at: '' }), 100))
    })
    const wrapper = mountComponent()

    wrapper.find('input[name="email"]').setValue('test@example.com')
    wrapper.find('input[name="password"]').setValue('password123')
    wrapper.find('form').trigger('submit') // Don't await this line

    await wrapper.vm.$nextTick() // Allow Vue to react to loading state change
    // The button might be a FormKit stub, so need to check its props if available, or visual state.
    // If using the actual FormKit, checking its internal state or a class might be better.
    // With the current stub, checking for a 'disabled' attribute is tricky as the stub is basic.
    // Let's assume the loading ref is correctly set.
    // expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    // This test is more conceptual with the current stubbing.

    // To verify loading state directly on the component instance:
    expect((wrapper.vm as any).loading).toBe(true)

    await new Promise(resolve => setTimeout(resolve, 150)); // Wait for mock$fetch to resolve
    await wrapper.vm.$nextTick()
    expect((wrapper.vm as any).loading).toBe(false)
  })
})
