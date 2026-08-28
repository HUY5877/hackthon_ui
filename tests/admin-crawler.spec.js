import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'


const { adminAPI } = vi.hoisted(() => ({
  adminAPI: {
    getCrawlerOverview: vi.fn(),
    createCrawlerTask: vi.fn(),
    listCrawlerTasks: vi.fn(),
    getCrawlerTask: vi.fn()
  }
}))

vi.mock('@/api', () => ({ adminAPI }))

import AdminCrawler from '@/views/Admin/AdminCrawler.vue'


const overview = {
  platforms: ['devpost', 'mlh'],
  schedules: { devpost: '每日 02:00', mlh: '每日 02:30' },
  scheduler_running: true,
  jobs: [],
  recent_runs: []
}


async function mountPage() {
  const wrapper = mount(AdminCrawler)
  await flushPromises()
  return wrapper
}


describe('administrator crawler operations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
    adminAPI.getCrawlerOverview.mockResolvedValue({ data: overview })
    adminAPI.listCrawlerTasks.mockResolvedValue({ data: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls an accepted task until completion', async () => {
    adminAPI.createCrawlerTask.mockResolvedValue({ data: { task_id: 'task-1', scope: 'all', progress: 5, phase: 'queued', status: 'queued', message: '任务已加入队列' } })
    adminAPI.getCrawlerTask
      .mockResolvedValueOnce({ data: { task_id: 'task-1', scope: 'all', progress: 55, phase: 'cleaning', status: 'running', message: '正在清洗', current_platform: 'devpost', completed_platforms: 0, total_platforms: 2 } })
      .mockResolvedValueOnce({ data: { task_id: 'task-1', scope: 'all', progress: 100, phase: 'completed', status: 'completed', message: '任务完成', completed_platforms: 2, total_platforms: 2 } })
    const wrapper = await mountPage()

    await wrapper.get('[data-test="run-all"]').trigger('click')
    await flushPromises()
    expect(localStorage.getItem('admin_crawler_task_id')).toBe('task-1')

    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('55')
    expect(wrapper.text()).toContain('devpost')
    expect(wrapper.get('[data-test="crawler-motion"]').classes()).toContain('progress-card--live')
    expect(wrapper.text()).toContain('清洗')

    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(wrapper.get('[data-test="crawler-motion"]').classes()).not.toContain('progress-card--live')
    expect(wrapper.get('[data-test="crawler-motion"]').classes()).toContain('progress-card--complete')
    expect(localStorage.getItem('admin_crawler_task_id')).toBeNull()

    const callsAfterCompletion = adminAPI.getCrawlerTask.mock.calls.length
    await vi.advanceTimersByTimeAsync(4000)
    expect(adminAPI.getCrawlerTask).toHaveBeenCalledTimes(callsAfterCompletion)
  })

  it('can trigger one platform and disables conflicting controls while active', async () => {
    adminAPI.createCrawlerTask.mockResolvedValue({ data: { task_id: 'task-2', scope: 'platform', platform: 'devpost', progress: 5, phase: 'queued', status: 'queued', message: '任务已加入队列' } })
    const wrapper = await mountPage()

    await wrapper.get('[data-test="run-platform-devpost"]').trigger('click')
    await flushPromises()

    expect(adminAPI.createCrawlerTask).toHaveBeenCalledWith({ scope: 'platform', platform: 'devpost' })
    expect(wrapper.get('[data-test="run-all"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-test="run-platform-mlh"]').attributes('disabled')).toBeDefined()
  })

  it('marks a restored missing task as interrupted and clears local state', async () => {
    localStorage.setItem('admin_crawler_task_id', 'expired-task')
    adminAPI.getCrawlerTask.mockRejectedValue({ response: { status: 404 } })

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('任务已中断')
    expect(localStorage.getItem('admin_crawler_task_id')).toBeNull()
  })
})
