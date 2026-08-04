<template>
  <article class="featured-event">
    <div class="featured-event__topline">
      <BaseBadge tone="brand">{{ statusLabel }}</BaseBadge>
      <span class="featured-event__deadline mono">{{ deadlineLabel }}</span>
    </div>

    <div class="featured-event__body">
      <div class="featured-event__visual" aria-hidden="true">
        <span class="mono">FEATURED</span>
        <strong>{{ platformInitial }}</strong>
      </div>
      <div class="featured-event__content">
        <span class="featured-event__source mono">{{ hackathon.source_platform || 'HackHub' }}</span>
        <h2 :title="hackathon.name">{{ displayName }}</h2>
        <p>{{ hackathon.summary }}</p>
        <div class="featured-event__meta">
          <span>{{ hackathon.location || '线上' }}</span>
          <span>{{ dateRange }}</span>
        </div>
        <div v-if="hackathon.track_tags?.length" class="featured-event__tags">
          <span v-for="tag in hackathon.track_tags.slice(0, 4)" :key="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="featured-event__action">
        <span class="featured-event__prize mono" :title="hackathon.prize_pool || undefined">{{ displayPrize }}</span>
        <BaseButton :to="`/hackathons/${hackathon.slug}`" size="sm">查看详情 <span aria-hidden="true">→</span></BaseButton>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { compactText } from '@/utils/text'

const props = defineProps({ hackathon: { type: Object, required: true } })

const platformInitial = computed(() => (props.hackathon.source_platform || 'H').slice(0, 1).toUpperCase())
const displayName = computed(() => compactText(props.hackathon.name, 49, '未命名赛事'))
const displayPrize = computed(() => compactText(props.hackathon.prize_pool, 25, '奖项待公布'))
const statusLabel = computed(() => ({ registering: '报名中', ongoing: '进行中', upcoming: '即将开始', ended: '已结束' }[props.hackathon.status] || '开放中'))

function formatDate(raw) {
  if (!raw) return '时间待定'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '时间待定'
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const dateRange = computed(() => {
  if (!props.hackathon.event_start && !props.hackathon.event_end) return '赛事时间待公布'
  return `${formatDate(props.hackathon.event_start)} — ${formatDate(props.hackathon.event_end)}`
})

const deadlineLabel = computed(() => {
  const raw = props.hackathon.registration_end || props.hackathon.event_start
  if (!raw) return '报名开放中'
  return `${formatDate(raw)} 截止`
})
</script>

<style scoped>
.featured-event { padding: var(--space-5); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); }
.featured-event__topline { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-4); }
.featured-event__deadline { color: var(--color-accent); font-size: var(--text-xs); }
.featured-event__body { display: grid; grid-template-columns: 116px minmax(0, 1fr) minmax(0, 120px); gap: var(--space-5); align-items: stretch; }
.featured-event__visual { min-height: 150px; display: flex; flex-direction: column; justify-content: space-between; padding: var(--space-4); color: white; background: linear-gradient(145deg, #173d2b, #2f674a); border-radius: 12px; overflow: hidden; }
.featured-event__visual span { font-size: 10px; letter-spacing: 0.08em; }
.featured-event__visual strong { align-self: flex-end; font-family: var(--font-display); font-size: 58px; line-height: 0.8; opacity: 0.18; }
.featured-event__content { min-width: 0; }
.featured-event__source { display: block; overflow: hidden; color: var(--color-text-tertiary); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.featured-event h2 { display: -webkit-box; margin: 5px 0 var(--space-2); overflow: hidden; font-size: clamp(20px, 2vw, 26px); line-height: 1.25; overflow-wrap: anywhere; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.featured-event p { color: var(--color-text-secondary); font-size: var(--text-sm); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.featured-event__meta { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-3); color: var(--color-text-tertiary); font-size: var(--text-xs); }
.featured-event__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--space-3); }
.featured-event__tags span { padding: 3px 8px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: 6px; font-size: 11px; }
.featured-event__action { min-width: 0; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: var(--space-4); }
.featured-event__prize { max-width: 100%; overflow: hidden; color: var(--color-accent); font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 680px) {
  .featured-event__body { grid-template-columns: 82px minmax(0, 1fr); }
  .featured-event__visual { min-height: 126px; }
  .featured-event__action { grid-column: 1 / -1; width: 100%; flex-direction: row; align-items: center; }
}

@media (max-width: 460px) {
  .featured-event { padding: var(--space-4); }
  .featured-event__body { grid-template-columns: 1fr; }
  .featured-event__visual { min-height: 96px; }
}
</style>
