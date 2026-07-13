<template>
  <RouterLink :to="`/empowerment/articles/${article.slug}`" class="article-card">
    <span class="article-card__visual" :class="`article-card__visual--${article.content_type}`">
      <span class="mono">{{ typeLabel }}</span>
      <strong aria-hidden="true">{{ article.content_type === 'guide' ? 'G' : 'V' }}</strong>
    </span>
    <span class="article-card__body">
      <span class="article-card__meta">
        <BaseBadge :tone="article.content_type === 'guide' ? 'neutral' : 'brand'">{{ typeLabel }}</BaseBadge>
        <span>{{ article.estimated_read_time || 10 }} 分钟</span>
      </span>
      <strong class="article-card__title">{{ article.title }}</strong>
      <span class="article-card__summary">{{ article.summary }}</span>
      <span class="article-card__footer">
        <span>{{ difficultyLabel }}</span><span aria-hidden="true">→</span>
      </span>
    </span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({ article: { type: Object, required: true } })
const typeLabel = computed(() => props.article.content_type === 'guide' ? '参赛指南' : 'Vibecoding')
const difficultyLabel = computed(() => ({ beginner: '入门', intermediate: '进阶', advanced: '高级' }[props.article.difficulty_level] || '通用'))
</script>

<style scoped>
.article-card { height: 100%; display: grid; grid-template-rows: 150px 1fr; color: inherit; background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); overflow: hidden; transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base); }
.article-card:hover { color: inherit; text-decoration: none; transform: translateY(-2px); border-color: var(--color-border); box-shadow: var(--shadow-lg); }
.article-card__visual { display: flex; align-items: flex-end; justify-content: space-between; padding: var(--space-5); color: white; background: linear-gradient(145deg, #173d2b, #4c7b61); overflow: hidden; }
.article-card__visual--guide { background: linear-gradient(145deg, #26334b, #697b94); }
.article-card__visual span { font-size: 10px; letter-spacing: 0.08em; }
.article-card__visual strong { font-family: var(--font-display); font-size: 72px; line-height: 0.7; opacity: 0.14; }
.article-card__body { min-width: 0; display: flex; flex-direction: column; padding: var(--space-5); }
.article-card__meta { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); color: var(--color-text-tertiary); font-size: var(--text-xs); }
.article-card__title { margin-top: var(--space-4); color: var(--color-text-primary); font-family: var(--font-display); font-size: var(--text-lg); line-height: 1.45; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.article-card__summary { margin-top: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.article-card__footer { display: flex; justify-content: space-between; margin-top: auto; padding-top: var(--space-5); color: var(--color-text-tertiary); font-size: var(--text-xs); }
</style>
