import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'


const { auth } = vi.hoisted(() => ({
  auth: {
    isLoggedIn: true,
    isAdmin: true,
    user: { username: 'admin' },
    logout: vi.fn(),
    refreshProfile: vi.fn().mockResolvedValue({ success: true })
  }
}))

vi.mock('@/stores/auth', () => ({ useAuthStore: () => auth }))
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ fullPath: '/' })
}))

import AppHeader from '@/components/layout/AppHeader.vue'


function mountHeader() {
  return mount(AppHeader, {
    global: {
      stubs: {
        Teleport: true,
        RouterLink: { template: '<a><slot /></a>' }
      }
    }
  })
}


describe('administrator navigation entry', () => {
  it('refreshes the current profile before relying on cached role data', () => {
    auth.isLoggedIn = true
    auth.refreshProfile.mockClear()

    mountHeader()

    expect(auth.refreshProfile).toHaveBeenCalledOnce()
  })

  it('is visible only to administrators', () => {
    auth.isAdmin = true
    expect(mountHeader().find('.admin-entry').exists()).toBe(true)

    auth.isAdmin = false
    expect(mountHeader().find('.admin-entry').exists()).toBe(false)
  })
})
