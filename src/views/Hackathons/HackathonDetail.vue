<template>
  <div class="page container page-section" :class="{ 'page--with-mobile-cta': hackathon?.registration_url }">
    <RouterLink to="/hackathons" class="back-link">← 返回赛事列表</RouterLink>
    <DataSourceNotice :mock="usingMock" class="source-notice" />

    <div v-if="loading" class="detail-skeleton" aria-label="正在加载赛事详情">
      <div class="skeleton-line skeleton-line--short"></div>
      <div class="skeleton-line skeleton-line--title"></div>
      <div class="skeleton-grid"><div v-for="n in 4" :key="n"></div></div>
    </div>

    <template v-else-if="hackathon">
      <header class="detail-hero">
        <div class="detail-hero__meta">
          <BaseBadge :tone="statusTone">{{ statusLabel }}</BaseBadge>
          <span class="mono">{{ hackathon.source_platform }}</span>
          <span v-if="hackathon.is_verified" class="verified">已验证信息</span>
        </div>
        <h1>{{ hackathon.name }}</h1>
        <p>{{ hackathon.summary }}</p>
        <div v-if="hackathon.track_tags?.length" class="tag-row">
          <span v-for="tag in hackathon.track_tags" :key="tag">{{ tag }}</span>
        </div>
      </header>

      <div class="detail-layout">
        <main class="detail-content">
          <section class="content-section">
            <span class="section-kicker mono">OVERVIEW</span>
            <h2>赛事介绍</h2>
            <div class="prose">{{ hackathon.description || hackathon.summary || '赛事详情正在完善中。' }}</div>
          </section>

          <section class="content-section">
            <span class="section-kicker mono">SCHEDULE</span>
            <h2>重要时间</h2>
            <div class="timeline">
              <div v-for="item in schedule" :key="item.label" class="timeline-item">
                <span class="timeline-dot" aria-hidden="true"></span>
                <span class="timeline-label">{{ item.label }}</span>
                <strong class="mono">{{ item.value }}</strong>
              </div>
            </div>
          </section>

          <section v-if="hackathon.tech_tags?.length" class="content-section">
            <span class="section-kicker mono">TECHNOLOGY</span>
            <h2>技术方向</h2>
            <div class="tech-grid">
              <span v-for="tag in hackathon.tech_tags" :key="tag">{{ tag }}</span>
            </div>
          </section>

          <section v-if="hackathon.sponsors?.length" class="content-section">
            <span class="section-kicker mono">PARTNERS</span>
            <h2>主办与合作伙伴</h2>
            <div class="sponsor-grid">
              <span v-for="sponsor in hackathon.sponsors" :key="sponsor">{{ sponsor }}</span>
            </div>
          </section>
        </main>

        <aside class="registration-card">
          <div class="registration-card__header">
            <span>报名信息</span>
            <BaseBadge :tone="statusTone">{{ statusLabel }}</BaseBadge>
          </div>
          <div class="prize-block">
            <span>总奖池</span>
            <strong class="mono">{{ hackathon.prize_pool || '待公布' }}</strong>
          </div>
          <dl class="facts-list">
            <div><dt>报名截止</dt><dd>{{ formatDate(hackathon.registration_end) }}</dd></div>
            <div><dt>赛事时间</dt><dd>{{ eventDateRange }}</dd></div>
            <div><dt>参赛形式</dt><dd>{{ modeLabel }}</dd></div>
            <div><dt>地点</dt><dd>{{ hackathon.location || '线上' }}</dd></div>
            <div v-if="hackathon.organizer"><dt>主办方</dt><dd>{{ hackathon.organizer }}</dd></div>
            <div v-if="hackathon.expected_participants"><dt>预计规模</dt><dd>{{ hackathon.expected_participants }}+ 人</dd></div>
          </dl>
          <BaseButton
            v-if="hackathon.registration_url"
            :href="hackathon.registration_url"
            target="_blank"
            size="lg"
            block
            @click="handleClick"
          >
            前往官网报名 <span aria-hidden="true">↗</span>
          </BaseButton>
          <p class="registration-hint">报名将在主办方官网完成，HackHub 不会代替你提交信息。</p>
        </aside>
      </div>

      <div v-if="hackathon.registration_url" class="mobile-cta">
        <div><span>总奖池</span><strong class="mono">{{ hackathon.prize_pool || '待公布' }}</strong></div>
        <BaseButton :href="hackathon.registration_url" target="_blank" @click="handleClick">官网报名 ↗</BaseButton>
      </div>
    </template>

    <EmptyState v-else title="赛事不存在" description="该赛事可能已被移除，或链接发生了变化。">
      <template #action><BaseButton to="/hackathons">浏览全部赛事</BaseButton></template>
    </EmptyState>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { hackathonsAPI } from '@/api'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()
const hackathon = ref(null)
const loading = ref(true)
const usingMock = ref(false)

const statusConfig = computed(() => ({
  upcoming: { label: '即将开始', tone: 'neutral' },
  registering: { label: '报名中', tone: 'brand' },
  ongoing: { label: '进行中', tone: 'warning' },
  ended: { label: '已结束', tone: 'neutral' }
}[hackathon.value?.status] || { label: '开放中', tone: 'brand' }))

const statusLabel = computed(() => statusConfig.value.label)
const statusTone = computed(() => statusConfig.value.tone)
const modeLabel = computed(() => ({ online: '线上', offline: '线下', hybrid: '线上 + 线下' }[hackathon.value?.mode] || hackathon.value?.mode || '线上'))

function formatDate(raw) {
  if (!raw) return '待公布'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '待公布'
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const eventDateRange = computed(() => `${formatDate(hackathon.value?.event_start)} — ${formatDate(hackathon.value?.event_end)}`)
const schedule = computed(() => [
  { label: '报名开始', value: formatDate(hackathon.value?.registration_start) },
  { label: '报名截止', value: formatDate(hackathon.value?.registration_end) },
  { label: '赛事开始', value: formatDate(hackathon.value?.event_start) },
  { label: '赛事结束', value: formatDate(hackathon.value?.event_end) }
])

async function handleClick() {
  try { await hackathonsAPI.recordClick(hackathon.value.id) } catch (_) { /* external navigation must continue */ }
}

onMounted(async () => {
  try {
    const res = await hackathonsAPI.getDetail(route.params.slug)
    hackathon.value = res.data
  } catch (error) {
    console.warn('Hackathon detail API unavailable, using demo data', error)
    usingMock.value = true
    hackathon.value = MOCK_DETAIL
  } finally {
    loading.value = false
  }
})

const MOCK_DETAIL = {
  id: 1,
  name: 'AI Hackathon 2026 · 生成式 AI 创新应用大赛',
  slug: route.params.slug,
  summary: '用 36 小时打造 AI 原生应用，与优秀开发者一起探索下一代产品。',
  description: '本届赛事聚焦生成式 AI、智能体和多模态应用。参赛团队需要围绕真实用户需求，在限定时间内完成从问题定义、产品设计到可演示原型的完整过程。评审将重点关注创新性、产品完成度、技术实现和社会价值。',
  source_platform: 'AI Community',
  status: 'registering',
  mode: 'hybrid',
  track_tags: ['AI Agent', '多模态', 'Developer Tools', '未来工作'],
  tech_tags: ['Python', 'TypeScript', 'OpenAI API', 'LangChain', 'Vue'],
  prize_pool: '¥600,000',
  location: '北京 + 线上',
  organizer: 'AI Community',
  sponsors: ['OpenAI', 'Google Cloud', '阿里云', 'GitHub'],
  expected_participants: 800,
  registration_start: '2026-07-20T00:00:00',
  registration_end: '2026-08-18T00:00:00',
  event_start: '2026-08-22T00:00:00',
  event_end: '2026-08-24T00:00:00',
  registration_url: '#',
  is_verified: true
}
</script>

<style scoped>
.back-link { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: var(--space-5); color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 600; }
.back-link:hover { color: var(--color-primary); text-decoration: none; }
.source-notice { margin-bottom: var(--space-6); }
.detail-hero { max-width: 920px; padding: var(--space-6) 0 var(--space-12); }
.detail-hero__meta { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-3); color: var(--color-text-tertiary); font-size: var(--text-xs); }
.verified { color: var(--color-success); }
.detail-hero h1 { margin: var(--space-5) 0 var(--space-4); font-size: clamp(2.5rem, 5vw, 4.25rem); line-height: 1.08; letter-spacing: -0.055em; }
.detail-hero > p { max-width: 760px; color: var(--color-text-secondary); font-size: var(--text-xl); line-height: 1.7; }
.tag-row { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-5); }
.tag-row span { padding: 5px 10px; color: var(--color-primary-dim); background: var(--color-primary-soft); border-radius: var(--radius-full); font-size: var(--text-xs); }
.detail-layout { display: grid; grid-template-columns: minmax(0, 8fr) minmax(300px, 4fr); gap: clamp(40px, 6vw, 80px); align-items: start; }
.detail-content { min-width: 0; }
.content-section { padding: var(--space-10) 0; border-top: 1px solid var(--color-border); }
.section-kicker { display: block; margin-bottom: var(--space-2); color: var(--color-primary); font-size: 10px; font-weight: 700; letter-spacing: 0.11em; }
.content-section h2 { margin-bottom: var(--space-5); font-size: var(--text-2xl); }
.prose { color: var(--color-text-secondary); font-size: var(--text-base); line-height: 1.9; white-space: pre-wrap; }
.timeline { display: grid; }
.timeline-item { min-height: 64px; display: grid; grid-template-columns: 18px 1fr auto; align-items: center; gap: var(--space-3); position: relative; border-bottom: 1px solid var(--color-border-subtle); }
.timeline-dot { width: 9px; height: 9px; background: var(--color-primary); border: 3px solid var(--color-primary-soft); border-radius: 50%; box-sizing: content-box; }
.timeline-label { color: var(--color-text-secondary); font-size: var(--text-sm); }
.timeline-item strong { font-size: var(--text-xs); }
.tech-grid,
.sponsor-grid { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.tech-grid span,
.sponsor-grid span { min-height: 40px; display: inline-flex; align-items: center; padding: 8px 13px; color: var(--color-text-secondary); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-control); font-size: var(--text-sm); }
.registration-card { position: sticky; top: calc(var(--header-height) + var(--space-6)); padding: var(--space-6); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-md); }
.registration-card__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); font-weight: 650; }
.prize-block { display: grid; gap: 3px; padding: var(--space-6) 0; }
.prize-block span { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.prize-block strong { color: var(--color-accent); font-size: var(--text-2xl); }
.facts-list { display: grid; gap: 0; margin-bottom: var(--space-6); }
.facts-list div { display: grid; grid-template-columns: 84px 1fr; gap: var(--space-3); padding: 11px 0; border-top: 1px solid var(--color-border-subtle); }
.facts-list dt { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.facts-list dd { color: var(--color-text-primary); font-size: var(--text-sm); text-align: right; }
.registration-hint { margin-top: var(--space-3); color: var(--color-text-tertiary); font-size: 11px; line-height: 1.5; text-align: center; }
.mobile-cta { display: none; }
.detail-skeleton { display: grid; gap: var(--space-5); padding: var(--space-10) 0; }
.skeleton-line,
.skeleton-grid div { background: linear-gradient(90deg, var(--surface-muted), #fafbf9, var(--surface-muted)); background-size: 200% 100%; animation: loading 1.4s ease-in-out infinite; }
.skeleton-line { height: 18px; border-radius: 6px; }
.skeleton-line--short { width: 180px; }
.skeleton-line--title { width: min(760px, 90%); height: 68px; }
.skeleton-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
.skeleton-grid div { height: 160px; border-radius: var(--radius-card); }
@keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; }
  .registration-card { position: static; }
  .registration-card > :last-child,
  .registration-card > :nth-last-child(2) { display: none; }
  .mobile-cta { position: fixed; right: 0; bottom: 0; left: 0; z-index: var(--z-sticky); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: 10px var(--layout-gutter); background: rgba(255, 255, 255, 0.96); border-top: 1px solid var(--color-border); box-shadow: 0 -8px 24px rgba(20, 35, 27, 0.08); backdrop-filter: blur(16px); }
  .mobile-cta > div { display: grid; }
  .mobile-cta span { color: var(--color-text-tertiary); font-size: 10px; }
  .mobile-cta strong { color: var(--color-accent); font-size: var(--text-sm); }
  .page--with-mobile-cta { padding-bottom: 96px; }
}
@media (max-width: 560px) {
  .detail-hero { padding-bottom: var(--space-8); }
  .detail-hero > p { font-size: var(--text-base); }
  .timeline-item { grid-template-columns: 18px 1fr; padding: var(--space-3) 0; }
  .timeline-item strong { grid-column: 2; }
  .skeleton-grid { grid-template-columns: 1fr; }
}
</style>
