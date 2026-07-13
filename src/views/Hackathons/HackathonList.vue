<template>
  <div class="page container page-section">
    <PageHeader
      eyebrow="DISCOVER EVENTS"
      title="找到适合你的赛事"
      description="按状态、形式和热度筛选全球黑客松，快速比较时间、地点、赛道和奖池。"
    >
      <template #action>
        <BaseButton class="mobile-filter-button" variant="secondary" block @click="filterOpen = true">
          筛选赛事
        </BaseButton>
      </template>
    </PageHeader>

    <DataSourceNotice :mock="usingMock" class="source-notice" />

    <div class="list-layout">
      <button v-if="filterOpen" class="filter-overlay" aria-label="关闭筛选" @click="filterOpen = false"></button>
      <aside class="filter-sidebar" :class="{ 'filter-sidebar--open': filterOpen }" aria-label="赛事筛选">
        <div class="filter-header">
          <div>
            <span class="filter-kicker mono">FILTERS</span>
            <h2>筛选条件</h2>
          </div>
          <button class="filter-close" type="button" aria-label="关闭筛选" @click="filterOpen = false">×</button>
        </div>

        <BaseInput
          v-model="filters.keyword"
          label="搜索"
          placeholder="赛事、赛道或城市"
          @input="debouncedSearch"
          @submit="fetchData"
        />

        <div class="filter-section">
          <span class="filter-label">赛事状态</span>
          <div class="choice-grid">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              class="choice-button"
              :class="{ active: filters.status === option.value }"
              @click="setFilter('status', option.value)"
            >{{ option.label }}</button>
          </div>
        </div>

        <BaseSelect v-model="filters.mode" label="参赛形式" @update:model-value="applyFilters">
          <option value="">全部形式</option>
          <option value="online">线上</option>
          <option value="offline">线下</option>
          <option value="hybrid">线上 + 线下</option>
        </BaseSelect>

        <BaseSelect v-model="filters.sort_by" label="排序方式" @update:model-value="applyFilters">
          <option value="event_start">开始时间</option>
          <option value="prize_pool_usd">奖池金额</option>
          <option value="view_count">赛事热度</option>
          <option value="created_at">最新收录</option>
        </BaseSelect>

        <div class="filter-actions">
          <BaseButton block @click="applyFilters">应用筛选</BaseButton>
          <BaseButton variant="ghost" block @click="resetFilters">重置条件</BaseButton>
        </div>
      </aside>

      <main class="results-area">
        <div class="results-toolbar">
          <p><strong>{{ total }}</strong> 场赛事</p>
          <div v-if="activeFilterLabels.length" class="active-filters">
            <button v-for="item in activeFilterLabels" :key="item.key" type="button" @click="clearFilter(item.key)">
              {{ item.label }} <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="hackathon-grid" aria-label="正在加载赛事">
          <div v-for="n in 6" :key="n" class="skeleton-card"></div>
        </div>
        <div v-else-if="items.length" class="hackathon-grid">
          <HackathonCard v-for="hackathon in items" :key="hackathon.id" :hackathon="hackathon" />
        </div>
        <EmptyState
          v-else
          title="没有找到匹配的赛事"
          description="试试减少筛选条件，或者搜索其他技术方向。"
        >
          <template #action><BaseButton variant="secondary" @click="resetFilters">清除筛选</BaseButton></template>
        </EmptyState>

        <nav v-if="totalPages > 1" class="pagination" aria-label="赛事分页">
          <BaseButton variant="secondary" size="sm" :disabled="page === 1" @click="changePage(page - 1)">上一页</BaseButton>
          <span class="page-info mono">{{ page }} / {{ totalPages }}</span>
          <BaseButton variant="secondary" size="sm" :disabled="page === totalPages" @click="changePage(page + 1)">下一页</BaseButton>
        </nav>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { hackathonsAPI } from '@/api'
import PageHeader from '@/components/common/PageHeader.vue'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import HackathonCard from '@/components/common/HackathonCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const route = useRoute()
const router = useRouter()
const items = ref([])
const loading = ref(true)
const usingMock = ref(false)
const filterOpen = ref(false)
const page = ref(1)
const pageSize = 12
const total = ref(0)
const totalPages = ref(1)

const filters = reactive({
  keyword: typeof route.query.keyword === 'string' ? route.query.keyword : '',
  status: '',
  mode: '',
  sort_by: 'event_start'
})

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'registering', label: '报名中' },
  { value: 'upcoming', label: '即将开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'ended', label: '已结束' }
]

const activeFilterLabels = computed(() => {
  const labels = []
  if (filters.status) labels.push({ key: 'status', label: statusOptions.find(item => item.value === filters.status)?.label })
  if (filters.mode) labels.push({ key: 'mode', label: { online: '线上', offline: '线下', hybrid: '混合' }[filters.mode] })
  if (filters.keyword) labels.push({ key: 'keyword', label: `“${filters.keyword}”` })
  return labels
})

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  fetchData()
}, 350)

function setFilter(key, value) {
  filters[key] = value
  applyFilters()
}

function clearFilter(key) {
  filters[key] = ''
  applyFilters()
}

function resetFilters() {
  Object.assign(filters, { keyword: '', status: '', mode: '', sort_by: 'event_start' })
  page.value = 1
  fetchData()
}

function applyFilters() {
  page.value = 1
  filterOpen.value = false
  fetchData()
}

async function fetchData() {
  loading.value = true
  router.replace({ query: filters.keyword ? { keyword: filters.keyword } : {} })
  try {
    const res = await hackathonsAPI.list({
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      mode: filters.mode || undefined,
      sort_by: filters.sort_by,
      page: page.value,
      page_size: pageSize
    })
    items.value = res.data?.items || []
    total.value = res.data?.total || items.value.length
    totalPages.value = res.data?.total_pages || 1
    usingMock.value = false
  } catch (error) {
    console.warn('Hackathon list API unavailable, using demo data', error)
    items.value = MOCK_HACKATHONS
    total.value = MOCK_HACKATHONS.length
    totalPages.value = 1
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

function changePage(nextPage) {
  page.value = nextPage
  fetchData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const MOCK_HACKATHONS = [
  { id: 1, name: 'AI Hackathon 2026', slug: 'ai-hackathon-2026', summary: '36 小时打造 AI 原生应用。', source_platform: 'AI Community', status: 'registering', mode: 'hybrid', track_tags: ['AI Agent', '多模态', 'DevTools'], prize_pool: '¥600,000', location: '北京 + 线上', registration_end: '2026-08-18T00:00:00' },
  { id: 2, name: 'Solana Renaissance Hackathon', slug: 'solana-renaissance', summary: '面向全球建设者的 Web3 创新赛事。', source_platform: 'Solana', status: 'ongoing', mode: 'online', track_tags: ['Web3', 'DeFi', 'Gaming'], prize_pool: '$1,000,000+', location: '全球线上', registration_end: '2026-08-11T00:00:00' },
  { id: 3, name: 'ETHGlobal Sydney 2026', slug: 'ethglobal-sydney', summary: '与全球以太坊开发者共创开放互联网。', source_platform: 'ETHGlobal', status: 'registering', mode: 'offline', track_tags: ['Web3', 'Layer2', 'Public Goods'], prize_pool: '$150,000', location: 'Sydney', registration_end: '2026-08-26T00:00:00' },
  { id: 4, name: 'Climate Tech Challenge', slug: 'climate-tech-challenge', summary: '解决能源、碳管理和可持续供应链问题。', source_platform: 'Climate Lab', status: 'upcoming', mode: 'hybrid', track_tags: ['Climate', 'AI', 'IoT'], prize_pool: '$120,000', location: '新加坡 + 线上', registration_end: '2026-09-02T00:00:00' },
  { id: 5, name: 'Cloud Native Innovation Cup', slug: 'cloud-native-cup', summary: '围绕云原生和开发者工具构建高效基础设施。', source_platform: 'Cloud Native', status: 'registering', mode: 'online', track_tags: ['Cloud', 'DevTools', 'Open Source'], prize_pool: '¥300,000', location: '线上', registration_end: '2026-09-10T00:00:00' },
  { id: 6, name: 'HackUST 2026', slug: 'hackust-2026', summary: '面向高校团队的年度创新马拉松。', source_platform: 'HKUST', status: 'upcoming', mode: 'offline', track_tags: ['Education', 'Smart City', 'Health'], prize_pool: 'HK$200,000', location: '香港科技大学', registration_end: '2026-09-15T00:00:00' }
]

onMounted(fetchData)
</script>

<style scoped>
.source-notice { margin-bottom: var(--space-6); }
.list-layout { display: grid; grid-template-columns: 244px minmax(0, 1fr); gap: var(--space-8); align-items: start; }
.filter-sidebar { position: sticky; top: calc(var(--header-height) + var(--space-6)); display: grid; gap: var(--space-6); padding: var(--space-5); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); }
.filter-header { display: flex; align-items: center; justify-content: space-between; }
.filter-kicker { display: block; margin-bottom: 4px; color: var(--color-primary); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; }
.filter-header h2 { font-size: var(--text-lg); }
.filter-close { width: 44px; height: 44px; display: none; color: var(--color-text-primary); background: var(--surface-muted); border: 0; border-radius: 50%; font-size: 24px; cursor: pointer; }
.filter-section { display: grid; gap: var(--space-2); }
.filter-label { color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 600; }
.choice-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.choice-button { min-height: 38px; padding: 6px 8px; color: var(--color-text-secondary); background: var(--surface-muted); border: 1px solid transparent; border-radius: 8px; font-size: var(--text-xs); cursor: pointer; }
.choice-button:hover { color: var(--color-primary); }
.choice-button.active { color: var(--color-text-inverse); background: var(--color-primary); }
.filter-actions { display: grid; gap: var(--space-2); }
.mobile-filter-button { display: none; }
.filter-overlay { display: none; }
.results-area { min-width: 0; }
.results-toolbar { min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-5); }
.results-toolbar p { color: var(--color-text-secondary); font-size: var(--text-sm); }
.results-toolbar strong { color: var(--color-text-primary); font-size: var(--text-lg); }
.active-filters { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.active-filters button { min-height: 32px; padding: 4px 9px; color: var(--color-primary-dim); background: var(--color-primary-soft); border: 0; border-radius: var(--radius-full); font-size: var(--text-xs); cursor: pointer; }
.hackathon-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
.skeleton-card { min-height: 360px; background: linear-gradient(90deg, var(--surface-muted), #fafbf9, var(--surface-muted)); background-size: 200% 100%; border-radius: var(--radius-card); animation: loading 1.4s ease-in-out infinite; }
.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-top: var(--space-10); }
.page-info { color: var(--color-text-tertiary); font-size: var(--text-xs); }
@keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 1100px) { .hackathon-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 820px) {
  .list-layout { grid-template-columns: 1fr; }
  .mobile-filter-button { display: inline-flex; }
  .filter-overlay { position: fixed; inset: 0; z-index: calc(var(--z-modal) - 1); display: block; background: rgba(23, 34, 28, 0.28); border: 0; }
  .filter-sidebar { width: min(88vw, 380px); height: 100dvh; position: fixed; top: 0; right: 0; z-index: var(--z-modal); align-content: start; border-radius: 0; box-shadow: var(--shadow-xl); transform: translateX(100%); transition: transform var(--transition-base); overflow-y: auto; }
  .filter-sidebar--open { transform: translateX(0); }
  .filter-close { display: grid; place-items: center; }
}
@media (max-width: 560px) {
  .hackathon-grid { grid-template-columns: 1fr; }
  .results-toolbar { align-items: flex-start; flex-direction: column; }
  .active-filters { justify-content: flex-start; }
}
</style>
