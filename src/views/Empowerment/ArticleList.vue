<template>
  <div class="page container page-section">
    <PageHeader eyebrow="LEARNING LIBRARY" title="参赛资源库" description="从 AI 辅助开发到组队、路演和评审策略，找到下一步需要的实战知识。" />
    <DataSourceNotice :mock="usingMock" class="source-notice" />

    <div class="toolbar">
      <BaseInput v-model="filters.keyword" placeholder="搜索文章" @submit="search" />
      <BaseSelect v-model="filters.content_type" @update:model-value="search">
        <option value="">全部类型</option>
        <option value="vibecoding">Vibecoding</option>
        <option value="guide">参赛指南</option>
      </BaseSelect>
      <BaseSelect v-model="filters.difficulty_level" @update:model-value="search">
        <option value="">全部难度</option>
        <option value="beginner">入门</option>
        <option value="intermediate">进阶</option>
        <option value="advanced">高级</option>
      </BaseSelect>
      <BaseButton @click="search">搜索</BaseButton>
    </div>

    <div class="result-line"><strong>{{ total }}</strong> 篇内容</div>
    <div v-if="loading" class="article-grid"><div v-for="n in 6" :key="n" class="skeleton-card"></div></div>
    <div v-else-if="items.length" class="article-grid"><ArticleCard v-for="article in items" :key="article.id" :article="article" /></div>
    <EmptyState v-else title="没有找到相关文章" description="试试其他关键词或减少筛选条件。" />

    <nav v-if="totalPages > 1" class="pagination" aria-label="文章分页">
      <BaseButton variant="secondary" size="sm" :disabled="page === 1" @click="changePage(page - 1)">上一页</BaseButton>
      <span class="mono">{{ page }} / {{ totalPages }}</span>
      <BaseButton variant="secondary" size="sm" :disabled="page === totalPages" @click="changePage(page + 1)">下一页</BaseButton>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { empowermentAPI } from '@/api'
import PageHeader from '@/components/common/PageHeader.vue'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ArticleCard from '@/components/content/ArticleCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const route = useRoute()
const router = useRouter()
const items = ref([])
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)
const loading = ref(true)
const usingMock = ref(false)
const filters = reactive({ keyword: '', content_type: typeof route.query.type === 'string' ? route.query.type : '', difficulty_level: '' })

async function search() {
  page.value = 1
  await fetchData()
}

async function fetchData() {
  loading.value = true
  router.replace({ query: filters.content_type ? { type: filters.content_type } : {} })
  try {
    const res = await empowermentAPI.listArticles({ ...filters, keyword: filters.keyword || undefined, content_type: filters.content_type || undefined, difficulty_level: filters.difficulty_level || undefined, page: page.value, page_size: 12 })
    items.value = res.data?.items || []
    total.value = res.data?.total || items.value.length
    totalPages.value = res.data?.total_pages || 1
    usingMock.value = false
  } catch (error) {
    console.warn('Article list API unavailable, using demo data', error)
    items.value = MOCK_ARTICLES
    total.value = items.value.length
    totalPages.value = 1
    usingMock.value = true
  } finally { loading.value = false }
}

function changePage(value) { page.value = value; fetchData(); window.scrollTo({ top: 0, behavior: 'smooth' }) }

const MOCK_ARTICLES = [
  { id: 1, title: '用 Cursor 从想法到可演示 MVP', slug: 'cursor-first-mvp', content_type: 'vibecoding', summary: '从需求拆解、代码生成到调试发布，完成你的第一个参赛原型。', difficulty_level: 'beginner', estimated_read_time: 15 },
  { id: 2, title: '黑客松组队：如何搭建高效互补的小团队', slug: 'teaming-guide', content_type: 'guide', summary: '明确角色、技能与协作节奏，在开赛前解决团队风险。', difficulty_level: 'beginner', estimated_read_time: 12 },
  { id: 3, title: 'AI Agent 项目的评审展示策略', slug: 'agent-demo-guide', content_type: 'guide', summary: '让复杂的智能体能力在三分钟路演中清晰可见。', difficulty_level: 'intermediate', estimated_read_time: 18 },
  { id: 4, title: 'Copilot 进阶：加速全栈原型开发', slug: 'copilot-fullstack', content_type: 'vibecoding', summary: '用任务拆分和上下文管理提高生成代码的可维护性。', difficulty_level: 'intermediate', estimated_read_time: 20 },
  { id: 5, title: '高分 Pitch Deck 的信息结构', slug: 'pitch-deck', content_type: 'guide', summary: '用问题、洞察、方案和证据建立有说服力的路演。', difficulty_level: 'intermediate', estimated_read_time: 16 },
  { id: 6, title: '多模型协作的开发工作流', slug: 'multi-model-workflow', content_type: 'vibecoding', summary: '合理分配研究、编码、评审和文档任务。', difficulty_level: 'advanced', estimated_read_time: 24 }
]

onMounted(fetchData)
</script>

<style scoped>
.source-notice { margin-bottom: var(--space-6); }
.toolbar { display: grid; grid-template-columns: minmax(240px, 1fr) 180px 160px auto; gap: var(--space-3); padding: var(--space-4); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); }
.result-line { margin: var(--space-6) 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
.result-line strong { color: var(--color-text-primary); font-size: var(--text-lg); }
.article-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
.skeleton-card { min-height: 380px; background: var(--surface-muted); border-radius: var(--radius-card); animation: pulse 1.4s ease-in-out infinite; }
.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-top: var(--space-10); color: var(--color-text-tertiary); font-size: var(--text-xs); }
@keyframes pulse { 50% { opacity: 0.55; } }
@media (max-width: 900px) { .toolbar { grid-template-columns: 1fr 1fr; } .article-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 580px) { .toolbar, .article-grid { grid-template-columns: 1fr; } }
</style>
