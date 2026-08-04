import { describe, expect, it, vi } from 'vitest'

import { resolveAdminAccess } from '@/router/access'


const adminRoute = {
  meta: { requiresAdmin: true },
  fullPath: '/admin/users'
}


describe('administrator route access', () => {
  it('allows unrelated routes without refreshing the profile', async () => {
    const auth = { refreshProfile: vi.fn() }

    expect(await resolveAdminAccess({ meta: {} }, auth)).toBe(true)
    expect(auth.refreshProfile).not.toHaveBeenCalled()
  })

  it('redirects signed-out users to login', async () => {
    const auth = { isLoggedIn: false, refreshProfile: vi.fn() }

    expect(await resolveAdminAccess(adminRoute, auth)).toEqual({
      name: 'login',
      query: { redirect: '/admin/users' }
    })
    expect(auth.refreshProfile).not.toHaveBeenCalled()
  })

  it('refreshes the profile before allowing an administrator', async () => {
    const auth = {
      isLoggedIn: true,
      isAdmin: true,
      refreshProfile: vi.fn().mockResolvedValue({ success: true })
    }

    expect(await resolveAdminAccess(adminRoute, auth)).toBe(true)
    expect(auth.refreshProfile).toHaveBeenCalledOnce()
  })

  it('redirects a non-admin away from admin routes', async () => {
    const auth = {
      isLoggedIn: true,
      isAdmin: false,
      refreshProfile: vi.fn().mockResolvedValue({ success: true })
    }

    expect(await resolveAdminAccess(adminRoute, auth)).toEqual({
      name: 'home',
      query: { denied: 'admin' }
    })
  })

  it('never trusts stale role data after a failed refresh', async () => {
    const auth = {
      isLoggedIn: true,
      isAdmin: true,
      refreshProfile: vi.fn().mockResolvedValue({ success: false })
    }

    expect(await resolveAdminAccess(adminRoute, auth)).toEqual({
      name: 'home',
      query: { denied: 'admin' }
    })
  })
})
