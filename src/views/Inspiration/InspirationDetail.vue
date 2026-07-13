<template>
  <main class="container page-section detail-page">
    <div v-if="loading" class="detail-skeleton" aria-label="正在加载"></div>

    <template v-else-if="item">
      <RouterLink to="/inspiration" class="back-link">← 返回灵感池</RouterLink>
      <DataSourceNotice :mock="usingMock" class="data-notice" />

      <header class="detail-hero">
        <div class="detail-hero__meta">
          <BaseBadge :tone="item.difficulty_level === 'advanced' ? 'warning' : 'brand'">{{ difficultyLabel }}</BaseBadge>
          <span>{{ item.source_hackathon_name }}</span>
          <span v-if="item.prize_won">{{ item.prize_won }}</span>
        </div>
        <h1>{{ item.title }}</h1>
        <p>{{ item.summary }}</p>
        <div class="detail-hero__facts">
          <span><small>TEAM</small>{{ item.team_name || '获奖团队' }}</span>
          <span><small>LIKES</small>{{ item.like_count || 0 }}</span>
          <span><small>VIEWS</small>{{ item.view_count || 0 }}</span>
        </div>
      </header>

      <section v-if="isRegWall" class="reg-wall" aria-labelledby="reg-wall-title">
        <div class="reg-wall__preview">
          <span class="mono">CASE PREVIEW / 公开摘要</span>
          <p>{{ item.teaser || '完整案例包含选题洞察、技术架构、团队分工和路演策略。' }}</p>
          <div class="reg-wall__fade" aria-hidden="true"></div>
        </div>
        <div class="reg-wall__panel">
          <span class="reg-wall__lock" aria-hidden="true">⌁</span>
          <h2 id="reg-wall-title">登录后继续阅读完整复盘</h2>
          <p>免费解锁技术架构、团队画像、源码与演示链接，并保存你感兴趣的案例。</p>
          <div class="reg-wall__actions">
            <BaseButton :to="{ path: '/login', query: { redirect: route.fullPath } }">登录并继续</BaseButton>
            <BaseButton to="/register" variant="secondary">创建账号</BaseButton>
          </div>
          <small>注册即表示你同意平台的基础服务条款。</small>
        </div>
      </section>

      <div v-else class="detail-layout">
        <article class="article-prose" v-html="renderedContent"></article>
        <aside class="resource-panel">
          <h2>项目资源</h2>
          <a v-if="item.demo_url" :href="item.demo_url" target="_blank" rel="noopener noreferrer">在线 Demo <span>↗</span></a>
          <a v-if="item.source_code_url" :href="item.source_code_url" target="_blank" rel="noopener noreferrer">项目源码 <span>↗</span></a>
          <a v-if="item.video_url" :href="item.video_url" target="_blank" rel="noopener noreferrer">演示视频 <span>↗</span></a>
          <a v-if="item.source_hackathon_url" :href="item.source_hackathon_url" target="_blank" rel="noopener noreferrer">赛事原页 <span>↗</span></a>
          <p v-if="!hasResources">该案例暂未附加外部资源。</p>
          <div v-if="item.tech_tags?.length" class="resource-panel__tags">
            <span v-for="tag in item.tech_tags" :key="tag">{{ tag }}</span>
          </div>
        </aside>
      </div>
    </template>

    <EmptyState v-else title="案例不存在" description="该案例可能已下线或链接有误。">
      <template #action><BaseButton to="/inspiration" variant="secondary">返回灵感池</BaseButton></template>
    </EmptyState>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { inspirationAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { renderSafeMarkdown } from '@/utils/safeMarkdown'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const auth = useAuthStore()
const item = ref(null)
const loading = ref(true)
const usingMock = ref(false)

const isRegWall = computed(() => !auth.isLoggedIn || !item.value?.full_content)
const difficultyLabel = computed(() => ({ beginner: '新手可复现', intermediate: '进阶案例', advanced: '高级案例' }[item.value?.difficulty_level] || '案例拆解'))
const renderedContent = computed(() => renderSafeMarkdown(item.value?.full_content || ''))
const hasResources = computed(() => Boolean(item.value?.demo_url || item.value?.source_code_url || item.value?.video_url || item.value?.source_hackathon_url))

onMounted(async () => {
  try {
    const res = await inspirationAPI.getDetail(route.params.slug)
    item.value = res.data
  } catch (_) {
    usingMock.value = true
    item.value = {
      id: 1,
      title: '用 GPT-4 打造个性化学习助手：冠军项目拆解',
      slug: route.params.slug,
      summary: '三人团队在 36 小时内用 GPT-4、LangChain 与知识图谱完成从洞察到演示的完整闭环。',
      teaser: '他们没有从“大而全的 AI 教育”切入，而是先锁定一个可在三分钟内被评委感知的学习反馈场景。',
      full_content: auth.isLoggedIn ? '## 项目背景\n\n团队将问题收敛到“如何让每次练习都形成可追踪的学习反馈”，并用最小数据闭环验证价值。\n\n## 技术架构\n\n1. 前端：Next.js 与轻量可视化\n2. 服务层：FastAPI 与 LangChain\n3. 模型层：GPT-4 与结构化提示词\n4. 数据层：Neo4j 与 PostgreSQL\n\n## 获奖关键\n\n- 三分钟内能看懂问题和价值\n- Demo 只保留一条核心用户路径\n- 团队分工与路演叙事保持一致' : null,
      source_hackathon_name: 'ETHGlobal 2025',
      team_name: 'EduAI', prize_won: '总冠军 + $50,000', difficulty_level: 'intermediate',
      tech_tags: ['GPT-4', 'LangChain', 'Next.js'], like_count: 2340, view_count: 15600,
      source_code_url: auth.isLoggedIn ? 'https://github.com/' : null,
      demo_url: auth.isLoggedIn ? 'https://example.com/' : null
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page { max-width: 1120px; padding-bottom: var(--space-20); }
.back-link { display: inline-flex; margin-bottom: var(--space-6); color: var(--color-text-secondary); font-size: var(--text-sm); }
.data-notice { margin-bottom: var(--space-5); }
.detail-hero { max-width: 900px; padding: var(--space-10) 0 var(--space-12); }
.detail-hero__meta { display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-3); color: var(--color-text-tertiary); font-size: var(--text-xs); }
.detail-hero h1 { margin-top: var(--space-5); font-size: clamp(2.25rem, 5vw, 4.25rem); letter-spacing: -.055em; line-height: 1.08; }
.detail-hero > p { max-width: 760px; margin-top: var(--space-5); color: var(--color-text-secondary); font-size: var(--text-lg); }
.detail-hero__facts { display: flex; flex-wrap: wrap; gap: var(--space-10); margin-top: var(--space-8); }
.detail-hero__facts span { display: grid; gap: 4px; color: var(--color-text-primary); font-weight: 650; }
.detail-hero__facts small { color: var(--color-text-tertiary); font: 600 10px/1 var(--font-mono); letter-spacing: .1em; }
.reg-wall { position: relative; max-width: 900px; margin-inline: auto; }
.reg-wall__preview { position: relative; min-height: 260px; padding: var(--space-8); color: var(--color-text-secondary); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); overflow: hidden; }
.reg-wall__preview > span { color: var(--color-primary); font-size: var(--text-xs); }
.reg-wall__preview > p { max-width: 680px; margin-top: var(--space-5); font-size: var(--text-lg); line-height: 1.8; }
.reg-wall__fade { position: absolute; inset: 45% 0 0; background: linear-gradient(transparent, var(--surface-card)); }
.reg-wall__panel { position: relative; z-index: 1; max-width: 600px; margin: -90px auto 0; padding: var(--space-10); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-xl); text-align: center; }
.reg-wall__lock { width: 48px; height: 48px; display: grid; place-items: center; margin: 0 auto var(--space-5); color: var(--color-primary); background: var(--color-primary-soft); border-radius: 14px; font-size: var(--text-xl); }
.reg-wall__panel h2 { font-size: var(--text-2xl); }
.reg-wall__panel p { margin: var(--space-3) auto 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
.reg-wall__actions { display: flex; justify-content: center; gap: var(--space-3); margin-top: var(--space-6); }
.reg-wall__panel small { display: block; margin-top: var(--space-4); color: var(--color-text-tertiary); }
.detail-layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: var(--space-12); align-items: start; }
.article-prose { min-width: 0; padding: var(--space-8); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); color: var(--color-text-secondary); line-height: 1.85; }
.article-prose :deep(h2), .article-prose :deep(h3), .article-prose :deep(h4) { margin: 1.8em 0 .65em; color: var(--color-text-primary); }
.article-prose :deep(h2:first-child), .article-prose :deep(h3:first-child) { margin-top: 0; }
.article-prose :deep(p), .article-prose :deep(ul), .article-prose :deep(ol) { margin-bottom: 1em; }
.article-prose :deep(ul), .article-prose :deep(ol) { padding-left: 1.5em; }
.resource-panel { position: sticky; top: calc(var(--header-height) + var(--space-6)); display: grid; gap: var(--space-2); padding: var(--space-6); background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); }
.resource-panel h2 { margin-bottom: var(--space-3); font-size: var(--text-lg); }
.resource-panel a { display: flex; justify-content: space-between; padding: var(--space-3) 0; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border-subtle); font-size: var(--text-sm); }
.resource-panel p { color: var(--color-text-tertiary); font-size: var(--text-sm); }
.resource-panel__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-4); }
.resource-panel__tags span { padding: 5px 8px; background: var(--surface-muted); border-radius: var(--radius-sm); font-size: var(--text-xs); }
.detail-skeleton { height: 660px; background: var(--surface-muted); border-radius: var(--radius-card); animation: pulse 1.4s infinite; }
@keyframes pulse { 50% { opacity: .55; } }
@media (max-width: 800px) { .detail-layout { grid-template-columns: 1fr; } .resource-panel { position: static; } }
@media (max-width: 640px) { .detail-hero { padding-top: var(--space-6); } .detail-hero__facts { gap: var(--space-6); } .reg-wall__panel { padding: var(--space-8) var(--space-5); } .reg-wall__actions { flex-direction: column; } .article-prose { padding: var(--space-5); } }
</style>
