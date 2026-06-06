<template>
  <div class="page container page-section">
    <div v-if="loading" class="skeleton-detail"></div>
    <template v-else-if="article">
      <router-link to="/empowerment" class="back-link mono">&larr; BACK TO EMPOWERMENT</router-link>
      <div class="detail-hero">
        <div class="hero-meta">
          <span class="type-badge mono">{{ article.content_type === 'vibecoding' ? 'VIBECODING' : 'GUIDE' }}</span>
          <span class="sub-badge mono" v-if="article.sub_category">{{ article.sub_category }}</span>
          <span class="read-time mono">&#x231A; {{ article.estimated_read_time }}min</span>
          <span class="diff-badge" :class="'diff--' + article.difficulty_level">
            {{ article.difficulty_level === 'beginner' ? '入门' : article.difficulty_level === 'intermediate' ? '进阶' : '高级' }}
          </span>
        </div>
        <h1>{{ article.title }}</h1>
        <p class="summary">{{ article.summary }}</p>
        <div class="tag-row" v-if="article.tags?.length">
          <span class="tag" v-for="t in article.tags" :key="t">#{{ t }}</span>
        </div>
      </div>
      <div class="content-area" v-html="renderedContent"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { empowermentAPI } from '@/api'

const route = useRoute()
const article = ref(null)
const loading = ref(true)

const renderedContent = computed(() => {
  if (!article.value?.full_content) return ''
  return article.value.full_content
    .replace(/## (.+)/g, '<h3 class="content-h3">$1</h3>')
    .replace(/### (.+)/g, '<h4 class="content-h4">$1</h4>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
})

onMounted(async () => {
  try {
    const res = await empowermentAPI.getArticle(route.params.slug)
    article.value = res.data
  } catch (e) {
    article.value = {
      title: '示例文章',
      content_type: 'vibecoding',
      sub_category: 'cursor',
      summary: '这是一篇示例教程。',
      full_content: '## 前言\n\n这篇文章将教你如何使用 AI 工具提升开发效率...\n\n## 核心步骤\n\n1. 选择合适的AI工具\n2. 学习Prompt Engineering\n3. 实践迭代',
      difficulty_level: 'beginner',
      estimated_read_time: 15,
      tags: ['Cursor', 'AI', '开发效率']
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.back-link { display: inline-block; margin-bottom: var(--space-6); font-size: var(--text-sm); color: var(--color-text-tertiary); }
.detail-hero { margin-bottom: var(--space-8); }
.hero-meta { display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; }
.type-badge { font-size: var(--text-xs); padding: 2px 8px; background: rgba(0, 212, 255, 0.1); color: var(--color-primary); border-radius: var(--radius-full); }
.sub-badge { font-size: var(--text-xs); padding: 2px 8px; background: var(--color-bg-secondary); color: var(--color-text-secondary); border-radius: var(--radius-full); }
.read-time { font-size: var(--text-xs); color: var(--color-text-tertiary); }
.diff-badge { font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-full); font-family: var(--font-mono); }
.diff--beginner { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.diff--intermediate { background: rgba(249, 115, 22, 0.15); color: var(--color-accent); }
.diff--advanced { background: rgba(239, 68, 68, 0.15); color: var(--color-error); }

.detail-hero h1 { font-size: var(--text-3xl); margin-bottom: var(--space-4); }
.summary { font-size: var(--text-lg); color: var(--color-text-secondary); margin-bottom: var(--space-4); }
.tag-row { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.tag { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-primary); background: rgba(0, 212, 255, 0.06); padding: 2px 8px; border-radius: var(--radius-sm); }

.content-area { line-height: 1.8; color: var(--color-text-secondary); max-width: 800px; }
.content-area :deep(.content-h3) { font-size: var(--text-xl); color: var(--color-text-primary); margin-top: var(--space-8); margin-bottom: var(--space-4); }
.content-area :deep(.content-h4) { font-size: var(--text-lg); color: var(--color-text-primary); margin-top: var(--space-6); margin-bottom: var(--space-3); }
.content-area :deep(p) { margin-bottom: var(--space-4); }

.skeleton-detail { height: 600px; background: var(--color-bg-secondary); border-radius: var(--radius-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
</style>