<template>
  <div class="page container page-section">
    <div class="page-header">
      <h1>&#x2606; 灵感池</h1>
      <p class="mono text-secondary">往期黑客松获奖案例深度拆解 · 看看大神们是怎么拿冠军的</p>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input v-model="filters.keyword" class="search-input mono" placeholder="搜索案例..." @input="debouncedSearch" />
      <select v-model="filters.difficulty_level" @change="search" class="filter-select mono">
        <option value="">全部难度</option>
        <option value="beginner">新手</option>
        <option value="intermediate">进阶</option>
        <option value="advanced">高级</option>
      </select>
      <select v-model="filters.sort_by" @change="search" class="filter-select mono">
        <option value="created_at">最新</option>
        <option value="like_count">最多赞</option>
        <option value="view_count">最热</option>
      </select>
    </div>

    <div v-if="loading" class="skeleton-grid">
      <SkeletonCard v-for="n in 6" :key="n" />
    </div>

    <div v-else class="inspiration-grid">
      <div v-for="item in items" :key="item.id" class="inspiration-card" @click="$router.push(`/inspiration/${item.slug}`)">
        <GlowCard>
          <div class="card-cover" v-if="item.cover_image_url">
            <img :src="item.cover_image_url" :alt="item.title" loading="lazy" />
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span class="difficulty-badge" :class="'diff--' + item.difficulty_level">
                {{ item.difficulty_level === 'beginner' ? '新手' : item.difficulty_level === 'intermediate' ? '进阶' : '高级' }}
              </span>
              <span class="source-name mono" v-if="item.source_hackathon_name">{{ item.source_hackathon_name }}</span>
            </div>
            <h4 class="card-title">{{ item.title }}</h4>
            <p class="card-summary">{{ item.summary }}</p>
            <div class="card-tags" v-if="item.category_tags?.length">
              <span class="tag" v-for="tag in item.category_tags.slice(0, 3)" :key="tag">#{{ tag }}</span>
            </div>
            <div class="card-footer">
              <span class="stat" v-if="item.team_name">&#x263A; {{ item.team_name }}</span>
              <span class="stat" v-if="item.prize_won">&#x2606; {{ item.prize_won }}</span>
              <span class="stat mono">&#x2764; {{ item.like_count }}</span>
              <span class="stat mono">&#x22A2; {{ item.view_count }}</span>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="btn-page mono" :disabled="page === 1" @click="changePage(page - 1)">PREV</button>
      <span class="page-info mono">{{ page }} / {{ totalPages }}</span>
      <button class="btn-page mono" :disabled="page === totalPages" @click="changePage(page + 1)">NEXT</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { inspirationAPI } from '@/api'
import GlowCard from '@/components/ui/GlowCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import { useDebounceFn } from '@vueuse/core'

const items = ref([])
const loading = ref(true)
const page = ref(1)
const pageSize = 20
const totalPages = ref(1)

const filters = reactive({
  keyword: '',
  difficulty_level: '',
  sort_by: 'created_at'
})

const debouncedSearch = useDebounceFn(() => { page.value = 1; search() }, 300)

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
    totalPages.value = res.data?.total_pages || 1
  } catch (e) {
    items.value = MOCK_ITEMS
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function changePage(p) { page.value = p; search(); window.scrollTo({ top: 0, behavior: 'smooth' }) }

const MOCK_ITEMS = [
  { id: 1, title: '【AI教育】GPT-4打造个性化学习助手 — ETHGlobal冠军拆解', slug: 'ethglobal-ai-edu', summary: 'MIT三人团队36小时构建AI教育工具', source_hackathon_name: 'ETHGlobal 2025', team_name: 'EduAI', prize_won: '总冠军 + $50K', category_tags: ['AI应用', '教育科技'], difficulty_level: 'intermediate', cover_image_url: 'https://picsum.photos/seed/eduai/400/200', like_count: 2340, view_count: 15600 },
  { id: 2, title: '【Web3×AI】去中心化GPU算力交易市场', slug: 'gpugrid-solana', summary: '四人团队构建DePIN算力平台', source_hackathon_name: 'Solana Renaissance', team_name: 'GPUGrid', prize_won: 'DePIN一等奖 + $75K', category_tags: ['Web3', 'AI应用'], difficulty_level: 'advanced', cover_image_url: 'https://picsum.photos/seed/gpugrid/400/200', like_count: 1890, view_count: 12300 },
  { id: 3, title: '【新手友好】非技术团队用Vibecoding获奖', slug: 'vibecoding-success', summary: '三位商学院学生用AI工具48小时构建产品', source_hackathon_name: 'HackUST 2025', team_name: 'CampusSwap', prize_won: '最佳产品设计奖', category_tags: ['Vibecoding', '生活方式'], difficulty_level: 'beginner', cover_image_url: 'https://picsum.photos/seed/campus/400/200', like_count: 5670, view_count: 35000 },
]

onMounted(search)
</script>

<style scoped>
.page-header { margin-bottom: var(--space-8); }
.page-header h1 { margin-bottom: var(--space-2); }

.filters { display: flex; gap: var(--space-4); margin-bottom: var(--space-8); }
.search-input { flex: 1; min-width: 280px; padding: var(--space-3) var(--space-4); background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-primary); font-size: var(--text-sm); }
.search-input:focus { border-color: var(--color-primary); outline: none; box-shadow: 0 0 8px rgba(0, 212, 255, 0.2); }
.filter-select { padding: var(--space-3) var(--space-4); background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-primary); font-size: var(--text-sm); cursor: pointer; }

.inspiration-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: var(--space-6); }

.inspiration-card { cursor: pointer; }

.card-cover { height: 180px; overflow: hidden; border-radius: var(--radius-md); margin-bottom: var(--space-4); }
.card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
.inspiration-card:hover .card-cover img { transform: scale(1.05); }

.card-meta { display: flex; gap: var(--space-3); margin-bottom: var(--space-3); align-items: center; }
.difficulty-badge { font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-full); font-family: var(--font-mono); }
.diff--beginner { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.diff--intermediate { background: rgba(249, 115, 22, 0.15); color: var(--color-accent); }
.diff--advanced { background: rgba(239, 68, 68, 0.15); color: var(--color-error); }

.source-name { font-size: var(--text-xs); color: var(--color-text-tertiary); }

.card-title { font-size: var(--text-base); margin-bottom: var(--space-2); line-height: 1.5; }
.card-summary { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-tags { display: flex; gap: var(--space-2); margin-bottom: var(--space-3); }
.tag { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-primary); background: rgba(0, 212, 255, 0.06); padding: 2px 8px; border-radius: var(--radius-sm); }

.card-footer { display: flex; gap: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border); }
.stat { font-size: var(--text-xs); color: var(--color-text-tertiary); }

.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: var(--space-6); }

.pagination { display: flex; justify-content: center; align-items: center; gap: var(--space-6); margin-top: var(--space-10); }
.btn-page { padding: var(--space-2) var(--space-5); background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-primary); cursor: pointer; font-size: var(--text-sm); }
.btn-page:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.btn-page:disabled { opacity: 0.3; cursor: not-allowed; }
.page-info { font-size: var(--text-sm); color: var(--color-text-secondary); }

@media (max-width: 768px) { .inspiration-grid { grid-template-columns: 1fr; } }
</style>