import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'


describe('administrator auth state', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('marks only admin users as administrators', () => {
    const store = useAuthStore()

    store.user = { id: 1, role: 'admin' }
    expect(store.isAdmin).toBe(true)

    store.user = { id: 2, role: 'developer' }
    expect(store.isAdmin).toBe(false)

    store.user = null
    expect(store.isAdmin).toBe(false)
  })
})
