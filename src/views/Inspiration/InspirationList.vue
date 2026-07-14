<template>
  <main class="container page-section inspiration-page">
    <PageHeader
      eyebrow="WINNING PROJECTS / 灵感池"
      title="拆解获奖项目，找到下一次突破口"
      description="从真实获奖案例中理解选题、技术路线与表达方式。先看公开摘要，登录后解锁完整复盘。"
    />

    <section class="filter-bar" aria-label="灵感内容筛选">
      <BaseInput
        v-model="filters.keyword"
        class="filter-bar__search"
        placeholder="搜索项目、赛道或技术栈"
        aria-label="搜索灵感案例"
        @input="debouncedSearch"
        @submit="resetAndSearch"
      >
        <template #prefix>⌕</template>
      </BaseInput>
      <BaseSelect v-model="filters.difficulty_level" aria-label="难度" @change="resetAndSearch">
        <option value="">全部难度</option>
        <option value="beginner">新手可复现</option>
        <option value="intermediate">进阶</option>
        <option value="advanced">高级</option>
      </BaseSelect>
      <BaseSelect v-model="filters.sort_by" aria-label="排序方式" @change="resetAndSearch">
        <option value="created_at">最新发布</option>
        <option value="like_count">最多点赞</option>
        <option value="view_count">最多浏览</option>
      </BaseSelect>
    </section>

    <DataSourceNotice :mock="usingMock" class="data-notice" />

    <div class="result-meta">
      <p><strong>{{ total }}</strong> 个案例</p>
      <button v-if="hasFilters" type="button" @click="clearFilters">清除筛选</button>
    </div>

    <div v-if="loading" class="case-grid" aria-label="正在加载">
      <div v-for="n in 6" :key="n" class="case-skeleton"></div>
    </div>

    <div v-else-if="items.length" class="case-grid">
      <RouterLink v-for="item in items" :key="item.id" :to="`/inspiration/${item.slug}`" class="case-card">
        <div class="case-card__cover" :class="{ 'case-card__cover--fallback': !item.cover_image_url }">
          <img v-if="item.cover_image_url" :src="item.cover_image_url" :alt="item.title" loading="lazy" />
          <span v-else aria-hidden="true">{{ item.team_name?.slice(0, 1) || 'H' }}</span>
          <BaseBadge class="case-card__difficulty" :tone="difficultyTone(item.difficulty_level)">
            {{ difficultyLabel(item.difficulty_level) }}
          </BaseBadge>
        </div>
        <div class="case-card__body">
          <span class="case-card__source mono">{{ item.source_hackathon_name || 'HACKATHON CASE' }}</span>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary }}</p>
          <div v-if="item.category_tags?.length" class="case-card__tags">
            <span v-for="tag in item.category_tags.slice(0, 3)" :key="tag">{{ tag }}</span>
          </div>
          <div class="case-card__footer">
            <span>{{ item.team_name || '获奖团队' }}</span>
            <span class="mono">♥ {{ formatCount(item.like_count) }} · ↗ {{ formatCount(item.view_count) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <EmptyState v-else title="没有找到匹配案例" description="换一个关键词或清除筛选后再试。">
      <template #action><BaseButton variant="secondary" @click="clearFilters">清除筛选</BaseButton></template>
    </EmptyState>

    <nav v-if="totalPages > 1" class="pagination" aria-label="分页">
      <BaseButton variant="secondary" :disabled="page === 1" @click="changePage(page - 1)">上一页</BaseButton>
      <span class="mono">{{ page }} / {{ totalPages }}</span>
      <BaseButton variant="secondary" :disabled="page === totalPages" @click="changePage(page + 1)">下一页</BaseButton>
    </nav>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { inspirationAPI } from '@/api'
import PageHeader from '@/components/common/PageHeader.vue'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const items = ref([])
const loading = ref(true)
const usingMock = ref(false)
const page = ref(1)
const pageSize = 12
const total = ref(0)
const totalPages = ref(1)
const filters = reactive({ keyword: '', difficulty_level: '', sort_by: 'created_at' })

const hasFilters = computed(() => Boolean(filters.keyword || filters.difficulty_level || filters.sort_by !== 'created_at'))
const debouncedSearch = useDebounceFn(resetAndSearch, 300)

async function search() {
  loading.value = true
  try {
    const res = await inspirationAPI.list({
      keyword: filters.keyword || undefined,
      difficulty_level: filters.difficulty_level || undefined,
      sort_by: filters.sort_by,
      page: page.value,
      page_size: pageSize
    })
    items.value = res.data?.items || []
    total.value = res.data?.total || items.value.length
    totalPages.value = res.data?.total_pages || 1
    usingMock.value = false
  } catch (_) {
    items.value = MOCK_ITEMS
    total.value = MOCK_ITEMS.length
    totalPages.value = 1
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

function resetAndSearch() { page.value = 1; search() }
function clearFilters() {
  filters.keyword = ''
  filters.difficulty_level = ''
  filters.sort_by = 'created_at'
  resetAndSearch()
}
function changePage(nextPage) {
  page.value = nextPage
  search()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function difficultyLabel(value) { return ({ beginner: '新手', intermediate: '进阶', advanced: '高级' }[value] || '通用') }
function difficultyTone(value) { return value === 'advanced' ? 'warning' : value === 'intermediate' ? 'neutral' : 'brand' }
function formatCount(value = 0) { return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : value }

const MOCK_ITEMS = [
  { id: 1, title: '用 GPT-4 打造个性化学习助手：ETHGlobal 冠军拆解', slug: 'ethglobal-ai-edu', summary: '三人团队如何在 36 小时内完成从知识图谱到可用产品的闭环。', source_hackathon_name: 'ETHGlobal 2025', team_name: 'EduAI', prize_won: '总冠军 + $50K', category_tags: ['AI 应用', '教育科技'], difficulty_level: 'intermediate', cover_image_url: 'https://picsum.photos/seed/eduai/800/480', like_count: 2340, view_count: 15600 },
  { id: 2, title: '去中心化 GPU 算力市场：从需求洞察到 Demo', slug: 'gpugrid-solana', summary: '四人团队如何缩小 DePIN 题目范围，并交付可被评委快速理解的产品。', source_hackathon_name: 'Solana Renaissance', team_name: 'GPUGrid', prize_won: 'DePIN 一等奖', category_tags: ['Web3', 'AI 应用'], difficulty_level: 'advanced', cover_image_url: 'https://picsum.photos/seed/gpugrid/800/480', like_count: 1890, view_count: 12300 },
  { id: 3, title: '非技术团队也能获奖：Vibecoding 实战复盘', slug: 'vibecoding-success', summary: '三位商学院学生用 AI 工具完成产品、验证与路演的完整过程。', source_hackathon_name: 'HackUST 2025', team_name: 'CampusSwap', prize_won: '最佳产品设计奖', category_tags: ['Vibecoding', '生活方式'], difficulty_level: 'beginner', cover_image_url: 'https://picsum.photos/seed/campus/800/480', like_count: 5670, view_count: 35000 }
]

onMounted(search)
</script>

<style scoped>
.inspiration-page { padding-bottom: var(--space-20); }
.filter-bar { display: grid; grid-template-columns: minmax(280px, 1fr) 180px 180px; gap: var(--space-3); padding: var(--space-4); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); }
.data-notice { margin-top: var(--space-4); }
.result-meta { display: flex; align-items: center; justify-content: space-between; margin: var(--space-8) 0 var(--space-4); color: var(--color-text-secondary); font-size: var(--text-sm); }
.result-meta strong { color: var(--color-text-primary); }
.result-meta button { color: var(--color-primary); background: none; border: 0; cursor: pointer; }
.case-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
.case-card { min-width: 0; color: inherit; background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); overflow: hidden; transition: transform var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base); }
.case-card:hover { color: inherit; text-decoration: none; transform: translateY(-3px); border-color: var(--color-border); box-shadow: var(--shadow-lg); }
.case-card__cover { position: relative; height: 190px; overflow: hidden; background: linear-gradient(145deg, #173d2b, #74917f); }
.case-card__cover img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
.case-card:hover .case-card__cover img { transform: scale(1.025); }
.case-card__cover--fallback { display: grid; place-items: center; }
.case-card__cover--fallback > span { color: rgba(255,255,255,.18); font: 700 6rem/1 var(--font-display); }
.case-card__difficulty { position: absolute; top: var(--space-4); left: var(--space-4); }
.case-card__body { display: flex; flex-direction: column; min-height: 285px; padding: var(--space-5); }
.case-card__source { color: var(--color-primary); font-size: 10px; letter-spacing: .08em; }
.case-card h2 { margin-top: var(--space-3); font-size: var(--text-lg); line-height: 1.4; }
.case-card p { margin-top: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.case-card__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-4); }
.case-card__tags span { padding: 4px 8px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: var(--radius-sm); font-size: var(--text-xs); }
.case-card__footer { display: flex; justify-content: space-between; gap: var(--space-3); margin-top: auto; padding-top: var(--space-5); color: var(--color-text-tertiary); border-top: 1px solid var(--color-border-subtle); font-size: var(--text-xs); }
.case-skeleton { height: 475px; background: linear-gradient(100deg, var(--surface-muted) 30%, #fff 50%, var(--surface-muted) 70%); background-size: 300% 100%; border-radius: var(--radius-card); animation: shimmer 1.4s infinite; }
.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-5); margin-top: var(--space-10); color: var(--color-text-tertiary); font-size: var(--text-sm); }
@keyframes shimmer { to { background-position: -150% 0; } }
@media (max-width: 900px) { .filter-bar { grid-template-columns: 1fr 1fr; } .filter-bar__search { grid-column: 1 / -1; } .case-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .filter-bar, .case-grid { grid-template-columns: 1fr; } .filter-bar__search { grid-column: auto; } .case-card__cover { height: 180px; } }
</style>
