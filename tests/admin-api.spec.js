import { beforeEach, describe, expect, it, vi } from 'vitest'


const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApi)
  }
}))

import { adminAPI } from '@/api'


describe('administrator API client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps user and hackathon operations to GET and POST', async () => {
    await adminAPI.listUsers({ keyword: 'dev' })
    await adminAPI.promoteUser(2)
    await adminAPI.listHackathons({ source_platform: 'devpost' })
    await adminAPI.getHackathon(3)
    await adminAPI.updateHackathon(3, { name: 'Updated' })
    await adminAPI.deleteHackathon(3, { confirm_name: 'Updated' })

    expect(mockApi.get).toHaveBeenCalledWith('/admin/users', { params: { keyword: 'dev' } })
    expect(mockApi.post).toHaveBeenCalledWith('/admin/users/2/promote')
    expect(mockApi.get).toHaveBeenCalledWith('/admin/hackathons', {
      params: { source_platform: 'devpost' }
    })
    expect(mockApi.get).toHaveBeenCalledWith('/admin/hackathons/3')
    expect(mockApi.post).toHaveBeenCalledWith('/admin/hackathons/3/update', { name: 'Updated' })
    expect(mockApi.post).toHaveBeenCalledWith('/admin/hackathons/3/delete', {
      confirm_name: 'Updated'
    })
  })

  it('maps crawler operations to GET and POST', async () => {
    await adminAPI.getCrawlerOverview()
    await adminAPI.createCrawlerTask({ scope: 'all' })
    await adminAPI.listCrawlerTasks({ status: 'running' })
    await adminAPI.getCrawlerTask('task-1')

    expect(mockApi.get).toHaveBeenCalledWith('/admin/crawler/overview')
    expect(mockApi.post).toHaveBeenCalledWith('/admin/crawler/tasks', { scope: 'all' })
    expect(mockApi.get).toHaveBeenCalledWith('/admin/crawler/tasks', {
      params: { status: 'running' }
    })
    expect(mockApi.get).toHaveBeenCalledWith('/admin/crawler/tasks/task-1')
  })

  it('does not use PUT, PATCH, or DELETE for administrator operations', async () => {
    await adminAPI.updateHackathon(3, { name: 'Updated' })
    await adminAPI.deleteHackathon(3, { confirm_name: 'Updated' })

    expect(mockApi.put).not.toHaveBeenCalled()
    expect(mockApi.patch).not.toHaveBeenCalled()
    expect(mockApi.delete).not.toHaveBeenCalled()
  })
})
