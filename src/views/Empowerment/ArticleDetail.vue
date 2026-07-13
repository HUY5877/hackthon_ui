<template>
  <main class="container page-section article-page">
    <div v-if="loading" class="article-skeleton" aria-label="正在加载"></div>
    <template v-else-if="article">
      <RouterLink to="/empowerment/articles" class="back-link">← 返回资源库</RouterLink>
      <DataSourceNotice :mock="usingMock" class="source-notice" />
      <header class="article-header">
        <div class="article-header__meta">
          <BaseBadge :tone="article.content_type === 'guide' ? 'neutral' : 'brand'">{{ typeLabel }}</BaseBadge>
          <span>{{ difficultyLabel }}</span><span>{{ article.estimated_read_time || 10 }} 分钟阅读</span>
        </div>
        <h1>{{ article.title }}</h1>
        <p>{{ article.summary }}</p>
        <div v-if="article.tags?.length" class="article-header__tags"><span v-for="tag in article.tags" :key="tag">{{ tag }}</span></div>
      </header>

      <div class="article-layout">
        <article class="article-prose" v-html="renderedContent"></article>
        <aside class="article-aside">
          <span class="mono">ARTICLE GUIDE</span>
          <h2>阅读建议</h2>
          <p>先快速读完结构，再回到与你当前参赛阶段最相关的部分执行。</p>
          <a v-if="article.external_url" :href="article.external_url" target="_blank" rel="noopener noreferrer">外部参考 ↗</a>
          <a v-if="article.video_url" :href="article.video_url" target="_blank" rel="noopener noreferrer">视频教程 ↗</a>
          <BaseButton to="/empowerment/articles" variant="secondary" block>继续浏览</BaseButton>
        </aside>
      </div>
    </template>
    <EmptyState v-else title="文章不存在" description="该内容可能已下线或链接有误。">
      <template #action><BaseButton to="/empowerment/articles">返回资源库</BaseButton></template>
    </EmptyState>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { empowermentAPI } from '@/api'
import { renderSafeMarkdown } from '@/utils/safeMarkdown'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const article = ref(null)
const loading = ref(true)
const usingMock = ref(false)
const renderedContent = computed(() => renderSafeMarkdown(article.value?.full_content || ''))
const typeLabel = computed(() => article.value?.content_type === 'guide' ? '参赛指南' : 'Vibecoding')
const difficultyLabel = computed(() => ({ beginner: '入门', intermediate: '进阶', advanced: '高级' }[article.value?.difficulty_level] || '通用'))

onMounted(async () => {
  try {
    const res = await empowermentAPI.getArticle(route.params.slug)
    article.value = res.data
  } catch (_) {
    usingMock.value = true
    article.value = {
      title: '用 Cursor 从想法到可演示 MVP', content_type: 'vibecoding', sub_category: 'cursor',
      summary: '从需求拆解、代码生成到调试发布，建立一套适合短周期参赛的 AI 开发工作流。',
      full_content: '## 先定义一个可演示的结果\n\n不要从“做一个完整平台”开始，而要描述评委在三分钟内能看到的变化。\n\n## 把任务拆成稳定的上下文\n\n1. 用一段话定义用户、问题和结果\n2. 每次只让 AI 处理一个可验证模块\n3. 运行、检查，再进入下一步\n\n## 保持代码可接管\n\n- 要求生成简短的变更说明\n- 把关键决策写入项目文档\n- 在每个阶段保留可运行版本\n\n> AI 的价值不是替你做完所有事，而是降低每一次验证的成本。',
      difficulty_level: 'beginner', estimated_read_time: 15, tags: ['Cursor', 'AI', 'MVP']
    }
  } finally { loading.value = false }
})
</script>

<style scoped>
.article-page { max-width: 1120px; padding-bottom: var(--space-20); }
.back-link { display: inline-flex; margin-bottom: var(--space-6); color: var(--color-text-secondary); font-size: var(--text-sm); }
.source-notice { margin-bottom: var(--space-5); }
.article-header { max-width: 880px; padding: var(--space-8) 0 var(--space-12); }
.article-header__meta { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-3); color: var(--color-text-tertiary); font-size: var(--text-xs); }
.article-header h1 { margin-top: var(--space-5); font-size: clamp(2.4rem, 5vw, 4.5rem); line-height: 1.07; letter-spacing: -.055em; }
.article-header > p { max-width: 760px; margin-top: var(--space-5); color: var(--color-text-secondary); font-size: var(--text-lg); }
.article-header__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-6); }
.article-header__tags span { padding: 5px 9px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: var(--radius-sm); font-size: var(--text-xs); }
.article-layout { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: var(--space-12); align-items: start; }
.article-prose { min-width: 0; padding: var(--space-10); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); color: var(--color-text-secondary); font-size: 1.02rem; line-height: 1.9; }
.article-prose :deep(h2), .article-prose :deep(h3), .article-prose :deep(h4) { margin: 1.8em 0 .6em; color: var(--color-text-primary); line-height: 1.3; }
.article-prose :deep(h2:first-child), .article-prose :deep(h3:first-child) { margin-top: 0; }
.article-prose :deep(p), .article-prose :deep(ul), .article-prose :deep(ol), .article-prose :deep(blockquote) { margin-bottom: 1.1em; }
.article-prose :deep(ul), .article-prose :deep(ol) { padding-left: 1.5em; }
.article-prose :deep(blockquote) { padding: var(--space-4) var(--space-5); color: var(--color-primary-dim); background: var(--color-primary-soft); border-left: 3px solid var(--color-primary); border-radius: 0 var(--radius-control) var(--radius-control) 0; }
.article-prose :deep(code) { padding: 2px 5px; background: var(--surface-muted); border-radius: 4px; font: .9em var(--font-mono); }
.article-aside { position: sticky; top: calc(var(--header-height) + var(--space-6)); display: grid; gap: var(--space-3); padding: var(--space-6); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); }
.article-aside > span { color: var(--color-primary); font-size: 10px; letter-spacing: .1em; }
.article-aside h2 { font-size: var(--text-lg); }
.article-aside p { color: var(--color-text-secondary); font-size: var(--text-sm); }
.article-aside a { color: var(--color-primary); font-size: var(--text-sm); }
.article-aside :deep(.base-button) { margin-top: var(--space-3); }
.article-skeleton { height: 700px; background: var(--surface-muted); border-radius: var(--radius-card); animation: pulse 1.4s infinite; }
@keyframes pulse { 50% { opacity: .55; } }
@media (max-width: 800px) { .article-layout { grid-template-columns: 1fr; } .article-aside { position: static; } }
@media (max-width: 640px) { .article-header { padding-top: var(--space-5); } .article-prose { padding: var(--space-5); } }
</style>
