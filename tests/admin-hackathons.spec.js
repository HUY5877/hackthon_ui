import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'


const { adminAPI } = vi.hoisted(() => ({
  adminAPI: {
    listHackathons: vi.fn(),
    getHackathon: vi.fn(),
    updateHackathon: vi.fn(),
    deleteHackathon: vi.fn()
  }
}))

vi.mock('@/api', () => ({ adminAPI }))

import AdminHackathons from '@/views/Admin/AdminHackathons.vue'


const hackathon = {
  id: 3,
  name: 'Build Green 2026',
  slug: 'build-green-2026',
  summary: 'A climate hackathon',
  description: 'Build practical climate tools.',
  status: 'registering',
  mode: 'hybrid',
  source_platform: 'devpost',
  source_url: 'https://devpost.com/build-green',
  registration_url: 'https://example.com/register',
  organizer: 'Green Lab',
  location: 'Shanghai',
  country: 'China',
  city: 'Shanghai',
  track_tags: ['Climate'],
  tech_tags: ['AI'],
  sponsors: ['HackHub'],
  prize_pool: '$10,000',
  prize_pool_usd: 10000,
  expected_participants: 200,
  registration_start: '2026-08-01T00:00:00',
  registration_end: '2026-08-20T00:00:00',
  event_start: '2026-08-21T00:00:00',
  event_end: '2026-08-23T00:00:00',
  cover_image: null,
  is_verified: false,
  llm_confidence: 0.9,
  view_count: 28,
  external_click_count: 4,
  created_at: '2026-08-03T12:00:00',
  updated_at: '2026-08-04T12:00:00'
}


async function mountPage() {
  const wrapper = mount(AdminHackathons, {
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


describe('administrator hackathon management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminAPI.listHackathons.mockResolvedValue({ data: { items: [hackathon], total: 1, page: 1, page_size: 20, total_pages: 1 } })
    adminAPI.getHackathon.mockResolvedValue({ data: hackathon })
    adminAPI.updateHackathon.mockImplementation(async (_id, data) => ({ data: { ...hackathon, ...data } }))
    adminAPI.deleteHackathon.mockResolvedValue({ data: { id: 3, name: hackathon.name } })
  })

  it('keeps lineage, counters, and timestamps read-only in the edit drawer', async () => {
    const wrapper = await mountPage()
    await wrapper.get('[data-test="edit-hackathon-3"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-test="edit-drawer"]').text()).toContain('devpost')
    expect(wrapper.find('input[name="slug"]').exists()).toBe(false)
    expect(wrapper.find('input[name="source_platform"]').exists()).toBe(false)
    expect(wrapper.find('input[name="view_count"]').exists()).toBe(false)
    expect(wrapper.find('input[name="created_at"]').exists()).toBe(false)
  })

  it('submits only changed editable fields', async () => {
    const wrapper = await mountPage()
    await wrapper.get('[data-test="edit-hackathon-3"]').trigger('click')
    await flushPromises()

    await wrapper.get('input[name="name"]').setValue('Build Greener 2026')
    await wrapper.get('[data-test="edit-save"]').trigger('click')
    await flushPromises()

    expect(adminAPI.updateHackathon).toHaveBeenCalledWith(3, { name: 'Build Greener 2026' })
    expect(wrapper.get('[data-test="hackathon-row-3"]').text()).toContain('Build Greener 2026')
  })

  it('requires the exact name before permanent deletion', async () => {
    const wrapper = await mountPage()
    await wrapper.get('[data-test="delete-hackathon-3"]').trigger('click')

    const submit = wrapper.get('[data-test="delete-submit"]')
    expect(submit.attributes('disabled')).toBeDefined()

    await wrapper.get('[data-test="delete-confirm-name"]').setValue('Build Green')
    expect(submit.attributes('disabled')).toBeDefined()

    await wrapper.get('[data-test="delete-confirm-name"]').setValue(hackathon.name)
    expect(submit.attributes('disabled')).toBeUndefined()
    await submit.trigger('click')
    await flushPromises()

    expect(adminAPI.deleteHackathon).toHaveBeenCalledWith(3, { confirm_name: hackathon.name })
    expect(wrapper.find('[data-test="hackathon-row-3"]').exists()).toBe(false)
  })
})
