<template>
  <div class="page container page-section">
    <div class="page-header">
      <h1>&#x2316; 信息大厅</h1>
      <p class="mono text-secondary">全站黑客松赛事 · AI 标准化引擎驱动 · 实时更新</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <input
          v-model="filters.keyword"
          type="text"
          class="search-input mono"
          placeholder="搜索赛事名称或关键词..."
          @input="debouncedSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="filters.status" @change="fetchData" class="filter-select mono">
          <option value="">全部状态</option>
          <option value="registering">报名中</option>
          <option value="upcoming">即将开始</option>
          <option value="ongoing">进行中</option>
          <option value="ended">已结束</option>
        </select>
        <select v-model="filters.mode" @change="fetchData" class="filter-select mono">
          <option value="">全部形式</option>
          <option value="online">线上</option>
          <option value="offline">线下</option>
          <option value="hybrid">线上+线下</option>
        </select>
        <select v-model="filters.sort_by" @change="fetchData" class="filter-select mono">
          <option value="event_start">按时间</option>
          <option value="prize_pool_usd">按奖金</option>
          <option value="view_count">按热度</option>
        </select>
      </div>
    </div>

    <!-- Results -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton-grid">
        <SkeletonCard v-for="n in 6" :key="n" />
      </div>
    </div>

    <template v-else>
      <div class="hackathon-grid">
        <HackathonCard
          v-for="h in items"
          :key="h.id"
          :hackathon="h"
          @click="$router.push(`/hackathons/${h.slug}`)"
        />
      </div>

      <!-- Empty state -->
      <div v-if="!items.length" class="empty-state">
        <span class="empty-icon">&#x2316;</span>
        <p>没有找到匹配的赛事</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="btn-page mono"
          :disabled="page === 1"
          @click="changePage(page - 1)"
        >
          PREV
        </button>
        <span class="page-info mono">{{ page }} / {{ totalPages }}</span>
        <button
          class="btn-page mono"
          :disabled="page === totalPages"
          @click="changePage(page + 1)"
        >
          NEXT
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { hackathonsAPI } from '@/api'
import HackathonCard from '@/components/common/HackathonCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { useDebounceFn } from '@vueuse/core'

const items = ref([])
const loading = ref(true)
const page = ref(1)
const pageSize = 20
const totalPages = ref(1)

const filters = reactive({
  keyword: '',
  status: '',
  mode: '',
  sort_by: 'event_start'
})

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  fetchData()
}, 300)

async function fetchData() {
  loading.value = true
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
    totalPages.value = res.data?.total_pages || 1
  } catch (e) {
    console.warn('API unavailable, using mock data')
    items.value = MOCK_HACKATHONS
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  page.value = p
  fetchData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const MOCK_HACKATHONS = [
  { id: 1, name: 'Solana Renaissance Hackathon', slug: 'solana-renaissance', summary: '$1M+ 奖金池', source_platform: 'solana', status: 'ongoing', mode: 'online', track_tags: ['Web3', 'DeFi', 'Gaming', 'DePIN', 'AIxCrypto'], prize_pool: '$1,000,000+', prize_pool_usd: 1000000, location: '线上', country: 'Global', registration_url: '#', organizer: 'Solana Foundation', view_count: 12500, external_click_count: 4100, created_at: '2026-04-20T00:00:00' },
  { id: 2, name: 'AI Hackathon 2026', slug: 'ai-hackathon-2026', summary: '36小时打造AI原生应用', source_platform: 'huodongxing', status: 'registering', mode: 'hybrid', track_tags: ['AI应用', '生成式AI', 'AI Agent'], prize_pool: '¥600,000 CNY', prize_pool_usd: 82000, location: '北京 + 线上', country: 'China', registration_url: '#', organizer: 'AI社区 & VC', view_count: 5670, external_click_count: 1203, created_at: '2026-05-08T00:00:00' },
  { id: 3, name: 'ETHGlobal Sydney 2026', slug: 'ethglobal-sydney', summary: '$150K Web3黑客松', source_platform: 'ethglobal', status: 'registering', mode: 'offline', track_tags: ['Web3', 'DeFi', 'NFT', 'Layer2'], prize_pool: '$150,000 USD', prize_pool_usd: 150000, location: 'Sydney, Australia', country: 'Australia', registration_url: '#', organizer: 'ETHGlobal', view_count: 3240, external_click_count: 856, created_at: '2026-05-10T00:00:00' },
  { id: 4, name: 'DoraHacks Quantum Leap', slug: 'dorahacks-quantum', summary: '量子计算黑客松', source_platform: 'dorahacks', status: 'upcoming', mode: 'online', track_tags: ['量子计算', 'AI', '密码学'], prize_pool: '$50,000 USD', prize_pool_usd: 50000, location: '线上', country: 'Global', registration_url: '#', organizer: 'DoraHacks x IBM', view_count: 1890, external_click_count: 423, created_at: '2026-05-25T00:00:00' },
  { id: 5, name: 'HackUST 2026', slug: 'hackust-2026', summary: '港科大年度创客马拉松', source_platform: 'hackust', status: 'upcoming', mode: 'offline', track_tags: ['教育科技', '智慧城市', '健康科技'], prize_pool: 'HK$200,000', prize_pool_usd: 25500, location: '香港科技大学', country: 'China', registration_url: '#', organizer: 'HKUST', view_count: 1560, external_click_count: 312, created_at: '2026-05-28T00:00:00' },
  { id: 6, name: 'MLH Global Hack Week — Cloud', slug: 'mlh-cloud-2026', summary: '全球线上黑客周', source_platform: 'mlh', status: 'registering', mode: 'online', track_tags: ['Cloud', 'Serverless', 'DevOps'], prize_pool: '$10,000 + 礼品', prize_pool_usd: 10000, location: '线上', country: 'Global', registration_url: '#', organizer: 'MLH', view_count: 8900, external_click_count: 2340, created_at: '2026-05-05T00:00:00' },
]

onMounted(fetchData)
</script>

<style scoped>
.page-header {
  margin-bottom: var(--space-8);
}

.page-header h1 {
  margin-bottom: var(--space-2);
}

/* ── Filters ── */
.filters {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: var(--space-3);
}

.search-input {
  flex: 1;
  min-width: 280px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.filter-select {
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--color-primary);
  outline: none;
}

/* ── Grid ── */
.hackathon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--space-6);
}

/* ── Skeleton ── */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--space-6);
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: var(--space-16) 0;
  color: var(--color-text-tertiary);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-4);
  opacity: 0.3;
}

/* ── Pagination ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-10);
}

.btn-page {
  padding: var(--space-2) var(--space-5);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.btn-page:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .hackathon-grid { grid-template-columns: 1fr; }
  .filters { flex-direction: column; }
  .search-input { min-width: 100%; }
}
</style>