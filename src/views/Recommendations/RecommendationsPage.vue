<template>
  <main class="container page-section recommendations-page">
    <PageHeader
      eyebrow="CURATED FOR YOU / 智能推荐"
      title="少刷榜单，多看真正适合你的机会"
      description="综合赛事热度、报名状态与你的技术和兴趣标签，给出更容易行动的参赛建议。"
    >
      <template #action><BaseButton v-if="auth.isLoggedIn" to="/profile" variant="secondary">调整我的标签</BaseButton></template>
    </PageHeader>
    <DataSourceNotice :mock="usingMock" class="source-notice" />

    <section class="recommend-section">
      <div class="section-heading">
        <div><span class="mono">PERSONAL MATCH</span><h2>猜你适合</h2></div>
        <p>根据画像与开放报名状态排序</p>
      </div>

      <div v-if="!auth.isLoggedIn" class="profile-callout">
        <div><strong>登录后解锁个性化推荐</strong><p>完善技术栈与兴趣标签，我们会解释每一条推荐为什么适合你。</p></div>
        <BaseButton :to="{ path: '/login', query: { redirect: '/recommendations' } }">登录并设置画像</BaseButton>
      </div>

      <div v-if="forYou.length" class="match-grid">
        <RouterLink v-for="(item, index) in forYou" :key="item.id" :to="`/hackathons/${item.slug}`" class="match-card">
          <div class="match-card__top">
            <BaseBadge tone="brand">{{ matchPercent(item, index) }}% MATCH</BaseBadge>
            <span class="mono">{{ statusLabel(item.status) }}</span>
          </div>
          <h3>{{ item.name }}</h3>
          <p>{{ item.summary }}</p>
          <div class="match-card__reason">
            <strong>推荐理由</strong>
            <span>{{ matchReason(item) }}</span>
          </div>
          <div class="match-card__footer">
            <span>{{ item.source_platform || '精选赛事' }}</span><span aria-hidden="true">查看详情 →</span>
          </div>
        </RouterLink>
      </div>
      <EmptyState v-else-if="auth.isLoggedIn" title="还没有匹配结果" description="先到个人中心完善技术栈和兴趣标签，我们会据此生成推荐。">
        <template #action><BaseButton to="/profile">完善画像</BaseButton></template>
      </EmptyState>
    </section>

    <section class="recommend-section">
      <div class="section-heading">
        <div><span class="mono">TRENDING NOW</span><h2>综合热度榜</h2></div>
        <p>浏览、关注与报名状态的综合排序</p>
      </div>
      <ol class="ranking-list">
        <li v-for="(item, index) in hotRankings" :key="item.id">
          <RouterLink :to="`/hackathons/${item.slug}`" class="ranking-row">
            <span class="ranking-row__number mono">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="ranking-row__main"><h3>{{ item.name }}</h3><p>{{ item.summary }}</p></div>
            <div class="ranking-row__tags">
              <span v-for="tag in (item.track_tags || []).slice(0, 2)" :key="tag">{{ tag }}</span>
            </div>
            <div class="ranking-row__metric"><strong>{{ formatCount(item.view_count) }}</strong><small>热度</small></div>
            <span class="ranking-row__arrow" aria-hidden="true">→</span>
          </RouterLink>
        </li>
      </ol>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { recommendationsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/common/PageHeader.vue'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const hotRankings = ref([])
const forYou = ref([])
const usingMock = ref(false)

function matchPercent(item, index) { return item.match_score || Math.max(72, 94 - index * 6) }
function statusLabel(status) { return ({ registering: '报名中', upcoming: '即将开始', ongoing: '进行中' }[status] || '值得关注') }
function matchReason(item) {
  if (item.match_reason) return item.match_reason
  const userTags = [...(auth.user?.profile_tags?.interests || []), ...(auth.user?.profile_tags?.tech_stack || [])]
  const eventTags = [...(item.track_tags || []), ...(item.tech_tags || [])]
  const matches = userTags.filter(tag => eventTags.some(eventTag => eventTag.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(eventTag.toLowerCase())))
  if (matches.length) return `与你的 ${matches.slice(0, 2).join('、')} 标签匹配，且当前仍可参与。`
  return item.status === 'registering' ? '当前开放报名，主题与开发者热门方向高度相关。' : '近期关注度持续上升，适合作为下一场备选赛事。'
}
function formatCount(value = 0) { return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : value }

onMounted(async () => {
  try {
    const requests = [recommendationsAPI.getHot(10)]
    if (auth.isLoggedIn) requests.push(recommendationsAPI.getForYou(5))
    const [hotRes, forYouRes] = await Promise.all(requests)
    hotRankings.value = hotRes.data || []
    forYou.value = forYouRes?.data || []
  } catch (_) {
    usingMock.value = true
    hotRankings.value = MOCK_EVENTS
    forYou.value = auth.isLoggedIn ? MOCK_EVENTS.slice(0, 3) : []
  }
})

const MOCK_EVENTS = [
  { id: 1, name: 'Solana Renaissance Hackathon', slug: 'solana-renaissance', summary: '$1M+ 奖金池，面向支付、DePIN 与消费者应用。', source_platform: 'Solana', status: 'registering', track_tags: ['Web3', 'DePIN'], tech_tags: ['Rust'], view_count: 12500 },
  { id: 2, name: 'MLH Global Hack Week — Cloud', slug: 'mlh-cloud', summary: '全球线上黑客周，短周期挑战与新手学习资源齐全。', source_platform: 'MLH', status: 'registering', track_tags: ['Cloud Native', 'DevTools'], tech_tags: ['JavaScript'], view_count: 8900 },
  { id: 3, name: 'AI Hackathon 2026', slug: 'ai-hackathon-2026', summary: '36 小时打造 AI 原生应用，强调可验证的真实场景。', source_platform: 'HackHub', status: 'upcoming', track_tags: ['AI', '教育科技'], tech_tags: ['Python'], view_count: 5670 },
  { id: 4, name: 'ETHGlobal Sydney 2026', slug: 'ethglobal-sydney', summary: '$150K 奖金池，亚太 Web3 开发者现场协作。', source_platform: 'ETHGlobal', status: 'upcoming', track_tags: ['Web3', 'FinTech'], tech_tags: ['Solidity'], view_count: 3240 },
  { id: 5, name: 'DoraHacks Quantum Leap', slug: 'dorahacks-quantum', summary: '量子计算与前沿算法主题线上挑战。', source_platform: 'DoraHacks', status: 'upcoming', track_tags: ['Deep Tech'], tech_tags: ['Python'], view_count: 1890 }
]
</script>

<style scoped>
.recommendations-page { padding-bottom: var(--space-20); }
.source-notice { margin-bottom: var(--space-8); }
.recommend-section + .recommend-section { margin-top: var(--space-16); }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); }
.section-heading span { color: var(--color-primary); font-size: 10px; letter-spacing: .1em; }
.section-heading h2 { margin-top: var(--space-2); font-size: var(--text-3xl); }
.section-heading > p { color: var(--color-text-tertiary); font-size: var(--text-sm); }
.profile-callout { display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); padding: var(--space-6); color: white; background: linear-gradient(130deg, var(--color-primary-dim), #315e47); border-radius: var(--radius-card); }
.profile-callout p { margin-top: var(--space-1); color: rgba(255,255,255,.7); font-size: var(--text-sm); }
.match-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
.match-card { display: flex; min-height: 330px; flex-direction: column; padding: var(--space-6); color: inherit; background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); transition: transform var(--transition-base), box-shadow var(--transition-base); }
.match-card:hover { color: inherit; text-decoration: none; transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.match-card__top, .match-card__footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.match-card__top > span:last-child { color: var(--color-text-tertiary); font-size: 10px; }
.match-card h3 { margin-top: var(--space-5); font-size: var(--text-xl); }
.match-card > p { margin-top: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); }
.match-card__reason { display: grid; gap: var(--space-2); margin-top: var(--space-5); padding: var(--space-4); background: var(--color-primary-soft); border-radius: var(--radius-control); font-size: var(--text-xs); }
.match-card__reason strong { color: var(--color-primary); }
.match-card__reason span { color: var(--color-text-secondary); }
.match-card__footer { margin-top: auto; padding-top: var(--space-5); color: var(--color-text-tertiary); border-top: 1px solid var(--color-border-subtle); font-size: var(--text-xs); }
.ranking-list { list-style: none; background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); overflow: hidden; }
.ranking-list li + li { border-top: 1px solid var(--color-border-subtle); }
.ranking-row { display: grid; grid-template-columns: 56px minmax(0, 1fr) 220px 72px 24px; align-items: center; gap: var(--space-5); padding: var(--space-5) var(--space-6); color: inherit; }
.ranking-row:hover { color: inherit; background: var(--surface-muted); text-decoration: none; }
.ranking-row__number { color: var(--color-text-tertiary); font-size: var(--text-lg); }
.ranking-list li:first-child .ranking-row__number { color: var(--color-accent); }
.ranking-row__main h3 { font-size: var(--text-base); }
.ranking-row__main p { margin-top: 3px; color: var(--color-text-secondary); font-size: var(--text-xs); }
.ranking-row__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.ranking-row__tags span { padding: 4px 8px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: var(--radius-sm); font-size: 11px; }
.ranking-row__metric { display: grid; justify-items: end; }
.ranking-row__metric small { color: var(--color-text-tertiary); font-size: 10px; }
.ranking-row__arrow { color: var(--color-primary); }
@media (max-width: 900px) { .match-grid { grid-template-columns: 1fr; } .match-card { min-height: 0; } .ranking-row { grid-template-columns: 44px minmax(0, 1fr) 72px 20px; } .ranking-row__tags { display: none; } }
@media (max-width: 640px) { .section-heading, .profile-callout { align-items: flex-start; flex-direction: column; } .section-heading > p { display: none; } .ranking-row { grid-template-columns: 34px minmax(0, 1fr) 18px; padding: var(--space-4); } .ranking-row__metric { display: none; } }
</style>
