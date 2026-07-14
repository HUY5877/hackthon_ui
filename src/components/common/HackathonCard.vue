<template>
  <RouterLink
    :to="`/hackathons/${hackathon.slug}`"
    class="hackathon-card"
  >
    <article>
      <div class="card-cover" :data-platform="hackathon.source_platform">
        <span class="cover-kicker mono">{{ platformLabel }}</span>
        <span class="cover-mark" aria-hidden="true">{{ platformInitial }}</span>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <BaseBadge :tone="statusTone">{{ statusLabel }}</BaseBadge>
          <span class="deadline mono">{{ deadlineLabel }}</span>
        </div>

        <h3 class="card-title">{{ hackathon.name }}</h3>
        <p class="card-summary">{{ hackathon.summary }}</p>

        <div v-if="hackathon.track_tags?.length" class="card-tags">
          <span v-for="tag in hackathon.track_tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="card-footer">
          <div class="location-wrap">
            <span class="footer-label">{{ hackathon.location || modeLabel }}</span>
          </div>
          <span class="prize mono">{{ hackathon.prize_pool || '奖项待公布' }}</span>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({
  hackathon: { type: Object, required: true }
})

const statusMap = {
  upcoming: { label: '即将开始', tone: 'neutral' },
  registering: { label: '报名中', tone: 'brand' },
  ongoing: { label: '进行中', tone: 'warning' },
  ended: { label: '已结束', tone: 'neutral' }
}

const statusLabel = computed(() => statusMap[props.hackathon.status]?.label || props.hackathon.status || '开放中')
const statusTone = computed(() => statusMap[props.hackathon.status]?.tone || 'neutral')
const platformLabel = computed(() => props.hackathon.source_platform || 'HackHub')
const platformInitial = computed(() => platformLabel.value.slice(0, 1).toUpperCase())
const modeLabel = computed(() => ({ online: '线上', offline: '线下', hybrid: '线上 + 线下' }[props.hackathon.mode] || '线上'))

const deadlineLabel = computed(() => {
  const rawDate = props.hackathon.registration_end || props.hackathon.event_start
  if (!rawDate) return '开放报名'
  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) return '开放报名'
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')} 截止`
})
</script>

<style scoped>
.hackathon-card {
  display: block;
  height: 100%;
  color: inherit;
  background: var(--surface-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
}

.hackathon-card:hover {
  color: inherit;
  text-decoration: none;
  transform: translateY(-2px);
  border-color: var(--color-border);
  box-shadow: var(--shadow-lg);
}

.hackathon-card article { height: 100%; display: flex; flex-direction: column; }

.card-cover {
  min-height: 132px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: var(--space-5);
  color: #f7fbf8;
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.2), transparent 30%),
    linear-gradient(135deg, #173d2b, #2f674a);
  overflow: hidden;
}

.card-cover::after {
  content: '';
  width: 120px;
  height: 120px;
  position: absolute;
  top: -42px;
  right: -30px;
  border: 26px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.cover-kicker { position: relative; z-index: 1; font-size: 11px; font-weight: 650; letter-spacing: 0.05em; }
.cover-mark { position: relative; z-index: 1; font-family: var(--font-display); font-size: 48px; font-weight: 750; line-height: 0.8; opacity: 0.18; }

.card-content { flex: 1; display: flex; flex-direction: column; padding: var(--space-5); }
.card-meta { min-height: 24px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-3); }
.deadline { color: var(--color-accent); font-size: 11px; }
.card-title { min-height: 48px; margin-bottom: var(--space-2); font-size: var(--text-lg); line-height: 1.35; }
.card-summary { color: var(--color-text-secondary); font-size: var(--text-sm); line-height: 1.55; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: var(--space-4); }
.tag { padding: 3px 8px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: 6px; font-size: 11px; }
.card-footer { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-3); margin-top: auto; padding-top: var(--space-5); }
.footer-label { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.prize { color: var(--color-accent); font-size: var(--text-sm); font-weight: 650; text-align: right; }
</style>
