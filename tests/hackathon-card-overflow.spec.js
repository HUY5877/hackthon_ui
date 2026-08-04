import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import FeaturedHackathon from '@/components/hackathon/FeaturedHackathon.vue'
import HackathonCard from '@/components/common/HackathonCard.vue'


const longName = '2026“AI生成世界”—AI图像图形技术创新大赛【AI机器人素养赛道】暨全国高校人工智能实践挑战赛'
const longPrize = '设一、二、三等奖及成功参赛奖，获奖比例按照参赛队伍数量计算，并提供完整证书与实践证明。'
const hackathon = {
  id: 2,
  slug: 'long-content',
  name: longName,
  summary: null,
  status: 'ended',
  mode: 'offline',
  source_platform: 'saikr',
  prize_pool: longPrize,
  event_start: '2026-07-30T00:00:00',
  event_end: '2026-07-29T00:00:00'
}

const global = {
  stubs: {
    RouterLink: { template: '<a><slot /></a>' },
    BaseButton: { template: '<button><slot /></button>' }
  }
}


describe('hackathon cards with crawler-length text', () => {
  it('bounds featured title and prize while retaining the full value as a tooltip', () => {
    const wrapper = mount(FeaturedHackathon, { props: { hackathon }, global })
    const title = wrapper.get('.featured-event__content h2')
    const prize = wrapper.get('.featured-event__prize')

    expect(title.text().length).toBeLessThanOrEqual(49)
    expect(title.text()).toMatch(/…$/)
    expect(title.attributes('title')).toBe(longName)
    expect(prize.text().length).toBeLessThanOrEqual(25)
    expect(prize.text()).toMatch(/…$/)
    expect(prize.attributes('title')).toBe(longPrize)
  })

  it('bounds regular card title and prize too', () => {
    const wrapper = mount(HackathonCard, { props: { hackathon }, global })

    expect(wrapper.get('.card-title').text().length).toBeLessThanOrEqual(49)
    expect(wrapper.get('.card-title').attributes('title')).toBe(longName)
    expect(wrapper.get('.prize').text().length).toBeLessThanOrEqual(25)
    expect(wrapper.get('.prize').attributes('title')).toBe(longPrize)
  })
})
