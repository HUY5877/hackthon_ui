import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'


const { adminAPI } = vi.hoisted(() => ({
  adminAPI: {
    listUsers: vi.fn(),
    promoteUser: vi.fn()
  }
}))

vi.mock('@/api', () => ({ adminAPI }))

import AdminUsers from '@/views/Admin/AdminUsers.vue'


const developer = {
  id: 2,
  email: 'dev@example.com',
  username: 'dev',
  role: 'developer',
  email_verified: true,
  created_at: '2026-08-04T12:00:00'
}

const administrator = {
  id: 1,
  email: 'admin@example.com',
  username: 'admin',
  role: 'admin',
  email_verified: true,
  created_at: '2026-08-03T12:00:00'
}


async function mountPage() {
  const wrapper = mount(AdminUsers, {
    global: {
      stubs: {
        Teleport: true,
        RouterLink: { template: '<a><slot /></a>' }
      }
    }
  })
  await flushPromises()
  return wrapper
}


describe('administrator user management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminAPI.listUsers.mockResolvedValue({
      data: {
        items: [developer, administrator],
        total: 2,
        page: 1,
        page_size: 20,
        total_pages: 1
      }
    })
    adminAPI.promoteUser.mockResolvedValue({
      data: { ...developer, role: 'admin' }
    })
  })

  it('offers promotion only for ordinary users', async () => {
    const wrapper = await mountPage()

    expect(wrapper.get('[data-test="promote-user-2"]').text()).toContain('设为管理员')
    expect(wrapper.find('[data-test="promote-user-1"]').exists()).toBe(false)
  })

  it('does not promote when confirmation is cancelled', async () => {
    const wrapper = await mountPage()

    await wrapper.get('[data-test="promote-user-2"]').trigger('click')
    expect(wrapper.get('[role="dialog"]').text()).toContain('dev')

    await wrapper.get('[data-test="confirm-cancel"]').trigger('click')

    expect(adminAPI.promoteUser).not.toHaveBeenCalled()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('promotes after confirmation and updates the row', async () => {
    const wrapper = await mountPage()

    await wrapper.get('[data-test="promote-user-2"]').trigger('click')
    await wrapper.get('[data-test="confirm-submit"]').trigger('click')
    await flushPromises()

    expect(adminAPI.promoteUser).toHaveBeenCalledWith(2)
    expect(wrapper.find('[data-test="promote-user-2"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="user-row-2"]').text()).toContain('管理员')
  })
})
