<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow mono">GLOBAL HACKATHON DISCOVERY</span>
          <h1>发现下一场<br /><span>值得参加的黑客松</span></h1>
          <p>
            聚合全球优质赛事，通过清晰的信息与智能推荐，
            帮你更快找到真正适合自己的参赛机会。
          </p>
          <div class="hero-actions">
            <BaseButton to="/hackathons" size="lg">立即探索 <span aria-hidden="true">→</span></BaseButton>
            <RouterLink to="/inspiration" class="quiet-link">看看获奖项目 <span aria-hidden="true">↗</span></RouterLink>
          </div>
          <div class="hero-proof">
            <span class="proof-dot" aria-hidden="true"></span>
            <span>每日更新来自全球平台的赛事信息</span>
          </div>
        </div>

        <div class="discovery-panel">
          <form class="search-bar" @submit.prevent="submitSearch">
            <BaseInput
              v-model="searchKeyword"
              placeholder="搜索赛事、赛道或城市"
              aria-label="搜索赛事、赛道或城市"
            >
              <template #prefix><span class="search-icon" aria-hidden="true"></span></template>
            </BaseInput>
            <BaseButton type="submit" size="lg">搜索</BaseButton>
          </form>

          <div v-if="loading" class="featured-skeleton" aria-label="正在加载精选赛事">
            <div class="skeleton-block skeleton-block--small"></div>
            <div class="skeleton-block skeleton-block--large"></div>
          </div>
          <FeaturedHackathon v-else-if="featuredHackathon" :hackathon="featuredHackathon" />
          <div v-else class="featured-empty">
            <strong>暂时没有可展示的赛事</strong>
            <span>稍后再来看看，或前往赛事大厅浏览全部内容。</span>
          </div>

          <div v-if="usingMock" class="demo-notice mono">当前展示演示数据</div>
        </div>
      </div>
    </section>

    <section class="container stats-section" aria-label="平台数据">
      <div class="stats-strip">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <span class="stat-value mono">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="container content-section">
      <div class="section-heading">
        <div>
          <span class="section-eyebrow mono">TRENDING NOW</span>
          <h2>热门赛事</h2>
        </div>
        <RouterLink to="/hackathons" class="section-link">查看全部赛事 <span aria-hidden="true">→</span></RouterLink>
      </div>

      <div v-if="loading" class="popular-grid" aria-label="正在加载热门赛事">
        <div v-for="n in 4" :key="n" class="card-skeleton"></div>
      </div>
      <div v-else-if="popularHackathons.length" class="popular-grid">
        <HackathonCard
          v-for="hackathon in popularHackathons"
          :key="hackathon.id"
          :hackathon="hackathon"
        />
      </div>
      <div v-else class="section-empty">暂时没有热门赛事。</div>
    </section>

    <section class="container lower-section">
      <article class="content-panel">
        <div class="panel-heading">
          <div>
            <span class="section-eyebrow mono">PERSONAL MATCH</span>
            <h2>为你推荐</h2>
          </div>
          <RouterLink to="/recommendations" class="section-link">更多推荐 <span aria-hidden="true">→</span></RouterLink>
        </div>
        <p v-if="!auth.isLoggedIn" class="panel-intro">
          登录并完善技术画像，获得更准确的赛事匹配结果。
        </p>
        <div v-if="forYou.length" class="compact-list">
          <HackathonCompactRow
            v-for="(hackathon, index) in forYou.slice(0, 3)"
            :key="hackathon.id"
            :hackathon="hackathon"
            :match="Math.max(78, 94 - index * 7)"
          />
        </div>
        <div v-else class="panel-empty">
          <span>还没有个性化结果</span>
          <BaseButton :to="auth.isLoggedIn ? '/profile' : '/login'" variant="secondary" size="sm">
            {{ auth.isLoggedIn ? '完善画像' : '登录后查看' }}
          </BaseButton>
        </div>
      </article>

      <article class="content-panel">
        <div class="panel-heading">
          <div>
            <span class="section-eyebrow mono">WINNING PROJECTS</span>
            <h2>获奖灵感</h2>
          </div>
          <RouterLink to="/inspiration" class="section-link">更多项目 <span aria-hidden="true">→</span></RouterLink>
        </div>
        <div class="project-list">
          <RouterLink
            v-for="(project, index) in winningProjects.slice(0, 2)"
            :key="project.id"
            :to="`/inspiration/${project.slug}`"
            class="project-row"
          >
            <span class="project-cover" :class="`project-cover--${index + 1}`">
              <span class="mono">{{ project.category_tags?.[0] || 'PROJECT' }}</span>
            </span>
            <span class="project-content">
              <strong>{{ project.title }}</strong>
              <small>{{ project.team_name || '优秀团队' }} · {{ project.prize_won || '获奖项目' }}</small>
              <span class="project-tags">
                <em v-for="tag in project.category_tags?.slice(0, 2)" :key="tag">{{ tag }}</em>
              </span>
            </span>
            <span class="project-arrow" aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { hackathonsAPI, inspirationAPI, recommendationsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import HackathonCard from '@/components/common/HackathonCard.vue'
import FeaturedHackathon from '@/components/hackathon/FeaturedHackathon.vue'
import HackathonCompactRow from '@/components/hackathon/HackathonCompactRow.vue'

const router = useRouter()
const auth = useAuthStore()
const searchKeyword = ref('')
const hotHackathons = ref([])
const forYou = ref([])
const winningProjects = ref([])
const loading = ref(true)
const usingMock = ref(false)

const stats = [
  { value: '2,350+', label: '全球赛事' },
  { value: '120+', label: '聚合数据源' },
  { value: '8,900+', label: '历史赛事' },
  { value: '每日', label: '信息更新' }
]

const featuredHackathon = computed(() => hotHackathons.value[0] || null)
const popularHackathons = computed(() => hotHackathons.value.slice(1, 5))

function submitSearch() {
  const keyword = searchKeyword.value.trim()
  router.push({ path: '/hackathons', query: keyword ? { keyword } : {} })
}

onMounted(async () => {
  try {
    const [hotRes, forYouRes, inspirationRes] = await Promise.all([
      hackathonsAPI.getHot(6),
      recommendationsAPI.getForYou(3).catch(() => ({ data: [] })),
      inspirationAPI.list({ page: 1, page_size: 2, sort_by: 'like_count' }).catch(() => ({ data: { items: [] } }))
    ])

    hotHackathons.value = hotRes.data || []
    forYou.value = forYouRes.data || []
    winningProjects.value = inspirationRes.data?.items || []

    if (!winningProjects.value.length) winningProjects.value = MOCK_PROJECTS
  } catch (error) {
    console.warn('Homepage API unavailable, using demo data', error)
    hotHackathons.value = MOCK_HOT
    forYou.value = MOCK_FOR_YOU
    winningProjects.value = MOCK_PROJECTS
    usingMock.value = true
  } finally {
    loading.value = false
  }
})

const MOCK_HOT = [
  { id: 1, name: 'AI Hackathon 2026 · 生成式 AI 创新应用大赛', slug: 'ai-hackathon-2026', summary: '用 36 小时打造 AI 原生应用，与优秀开发者一起探索下一代产品。', source_platform: 'AI Community', status: 'registering', mode: 'hybrid', track_tags: ['AI Agent', '多模态', 'Developer Tools'], prize_pool: '¥600,000', location: '北京 + 线上', registration_end: '2026-08-18T00:00:00', event_start: '2026-08-22T00:00:00', event_end: '2026-08-24T00:00:00' },
  { id: 2, name: 'Solana Renaissance Hackathon', slug: 'solana-renaissance', summary: '面向全球建设者的 Web3 创新赛事。', source_platform: 'Solana', status: 'ongoing', mode: 'online', track_tags: ['Web3', 'DeFi', 'Gaming'], prize_pool: '$1,000,000+', location: '全球线上', registration_end: '2026-08-11T00:00:00' },
  { id: 3, name: 'ETHGlobal Sydney 2026', slug: 'ethglobal-sydney', summary: '与全球以太坊开发者共创开放互联网。', source_platform: 'ETHGlobal', status: 'registering', mode: 'offline', track_tags: ['Web3', 'Layer2', 'Public Goods'], prize_pool: '$150,000', location: 'Sydney', registration_end: '2026-08-26T00:00:00' },
  { id: 4, name: 'Climate Tech Challenge', slug: 'climate-tech-challenge', summary: '用技术解决能源、碳管理和可持续供应链问题。', source_platform: 'Climate Lab', status: 'upcoming', mode: 'hybrid', track_tags: ['Climate', 'AI', 'IoT'], prize_pool: '$120,000', location: '新加坡 + 线上', registration_end: '2026-09-02T00:00:00' },
  { id: 5, name: 'Cloud Native Innovation Cup', slug: 'cloud-native-cup', summary: '围绕云原生和开发者工具构建高效基础设施。', source_platform: 'Cloud Native', status: 'registering', mode: 'online', track_tags: ['Cloud', 'DevTools', 'Open Source'], prize_pool: '¥300,000', location: '线上', registration_end: '2026-09-10T00:00:00' }
]

const MOCK_FOR_YOU = MOCK_HOT.slice(1, 4)

const MOCK_PROJECTS = [
  { id: 1, title: 'EcoTrack：面向企业的智能碳排分析平台', slug: 'ecotrack', team_name: 'Northstar', prize_won: '最佳社会影响奖', category_tags: ['AI/ML', 'Climate'] },
  { id: 2, title: 'MindBridge：让知识协作更自然的 AI 工作台', slug: 'mindbridge', team_name: 'Team Echo', prize_won: '产品创新奖', category_tags: ['AI Agent', 'Productivity'] }
]
</script>

<style scoped>
.home-page { overflow: hidden; }

.hero-section {
  position: relative;
  padding: clamp(72px, 8vw, 112px) 0 var(--space-16);
  background:
    radial-gradient(circle at 12% 18%, rgba(36, 84, 61, 0.07), transparent 28%),
    linear-gradient(180deg, #fbfbf8 0%, var(--surface-page) 100%);
}

.hero-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(520px, 7fr); align-items: center; gap: clamp(48px, 6vw, 84px); }
.hero-copy { max-width: 500px; }
.eyebrow,
.section-eyebrow { display: block; color: var(--color-primary); font-size: 11px; font-weight: 700; letter-spacing: 0.11em; }
.hero-copy h1 { margin: var(--space-5) 0 var(--space-6); font-size: var(--text-hero); font-weight: 680; line-height: 1.08; letter-spacing: -0.055em; }
.hero-copy h1 span { color: var(--color-primary-dim); }
.hero-copy > p { max-width: 470px; color: var(--color-text-secondary); font-size: var(--text-lg); line-height: 1.8; }
.hero-actions { display: flex; align-items: center; gap: var(--space-5); margin-top: var(--space-8); }
.quiet-link { min-height: 44px; display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 600; }
.quiet-link:hover { color: var(--color-primary); text-decoration: none; }
.hero-proof { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-6); color: var(--color-text-tertiary); font-size: var(--text-xs); }
.proof-dot { width: 7px; height: 7px; background: var(--color-success); border-radius: 50%; box-shadow: 0 0 0 4px rgba(35, 122, 75, 0.1); }

.discovery-panel { min-width: 0; }
.search-bar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-3); margin-bottom: var(--space-3); }
.search-icon { width: 15px; height: 15px; display: block; position: relative; border: 1.8px solid currentColor; border-radius: 50%; }
.search-icon::after { content: ''; width: 6px; height: 1.8px; position: absolute; right: -5px; bottom: -2px; background: currentColor; border-radius: 2px; transform: rotate(45deg); }
.demo-notice { margin-top: var(--space-3); color: var(--color-text-tertiary); font-size: 10px; text-align: right; }

.featured-skeleton { min-height: 260px; display: grid; grid-template-columns: 116px 1fr; gap: var(--space-5); padding: var(--space-5); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); }
.skeleton-block,
.card-skeleton { background: linear-gradient(90deg, var(--surface-muted), #f7f8f6, var(--surface-muted)); background-size: 200% 100%; animation: loading 1.4s ease-in-out infinite; }
.skeleton-block--small { border-radius: 12px; }
.skeleton-block--large { height: 70%; align-self: center; border-radius: 10px; }
.featured-empty { min-height: 240px; display: grid; place-content: center; gap: var(--space-2); padding: var(--space-8); color: var(--color-text-secondary); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-card); text-align: center; }
.featured-empty strong { color: var(--color-text-primary); }

.stats-section { position: relative; margin-top: calc(var(--space-8) * -1); }
.stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); }
.stat-item { min-height: 96px; display: grid; place-content: center; gap: 2px; position: relative; text-align: center; }
.stat-item:not(:last-child)::after { content: ''; width: 1px; height: 38px; position: absolute; top: 50%; right: 0; background: var(--color-border-subtle); transform: translateY(-50%); }
.stat-value { color: var(--color-text-primary); font-size: var(--text-xl); font-weight: 750; }
.stat-label { color: var(--color-text-tertiary); font-size: var(--text-xs); }

.content-section { padding-top: var(--space-20); }
.section-heading,
.panel-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-5); }
.section-heading { margin-bottom: var(--space-6); }
.section-heading h2,
.panel-heading h2 { margin-top: 5px; font-size: var(--text-2xl); }
.section-link { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-primary-dim); font-size: var(--text-sm); font-weight: 600; white-space: nowrap; }
.section-link:hover { color: var(--color-primary); text-decoration: none; }
.popular-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-5); }
.card-skeleton { min-height: 360px; border-radius: var(--radius-card); }
.section-empty { padding: var(--space-16); color: var(--color-text-tertiary); background: var(--surface-card); border: 1px dashed var(--color-border); border-radius: var(--radius-card); text-align: center; }

.lower-section { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); padding-top: var(--space-20); }
.content-panel { min-width: 0; padding: var(--space-6); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); }
.panel-heading { padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-border-subtle); }
.panel-intro { margin-top: var(--space-4); color: var(--color-text-tertiary); font-size: var(--text-sm); }
.compact-list { margin-top: var(--space-2); }
.panel-empty { min-height: 200px; display: grid; place-content: center; justify-items: center; gap: var(--space-4); color: var(--color-text-tertiary); font-size: var(--text-sm); }
.project-list { margin-top: var(--space-2); }
.project-row { min-height: 104px; display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; align-items: center; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border-subtle); }
.project-row:last-child { border-bottom: 0; }
.project-row:hover { color: inherit; text-decoration: none; }
.project-cover { height: 76px; display: flex; align-items: flex-end; padding: var(--space-3); color: white; background: linear-gradient(145deg, #173d2b, #4c7b61); border-radius: 10px; overflow: hidden; }
.project-cover--2 { background: linear-gradient(145deg, #26334b, #657a94); }
.project-cover span { font-size: 9px; letter-spacing: 0.04em; }
.project-content { min-width: 0; display: grid; gap: 4px; }
.project-content strong { overflow: hidden; color: var(--color-text-primary); font-size: var(--text-sm); text-overflow: ellipsis; white-space: nowrap; }
.project-content small { overflow: hidden; color: var(--color-text-tertiary); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.project-tags { display: flex; gap: 5px; margin-top: 2px; }
.project-tags em { padding: 2px 6px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: 5px; font-size: 10px; font-style: normal; }
.project-arrow { color: var(--color-text-tertiary); }

@keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 1120px) {
  .hero-grid { grid-template-columns: minmax(0, 4fr) minmax(480px, 6fr); gap: var(--space-10); }
  .popular-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .hero-section { padding-top: var(--space-16); }
  .hero-grid { grid-template-columns: 1fr; }
  .hero-copy { max-width: 680px; }
  .lower-section { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .popular-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stats-strip { grid-template-columns: repeat(2, 1fr); }
  .stat-item:nth-child(2)::after { display: none; }
  .stat-item:nth-child(-n + 2) { border-bottom: 1px solid var(--color-border-subtle); }
}

@media (max-width: 520px) {
  .hero-section { padding-top: var(--space-12); }
  .hero-copy h1 { font-size: clamp(2.5rem, 12vw, 3.25rem); }
  .hero-copy > p { font-size: var(--text-base); }
  .hero-actions { align-items: flex-start; flex-direction: column; gap: var(--space-3); }
  .search-bar { grid-template-columns: 1fr; }
  .popular-grid { grid-template-columns: 1fr; }
  .content-section,
  .lower-section { padding-top: var(--space-16); }
  .section-heading,
  .panel-heading { align-items: flex-start; }
  .content-panel { padding: var(--space-5); }
  .project-row { grid-template-columns: 72px minmax(0, 1fr); }
  .project-cover { width: 72px; height: 68px; }
  .project-arrow { display: none; }
}
</style>
