<template>
  <div class="page container page-section">
    <div v-if="loading" class="skeleton-detail"></div>

    <template v-else-if="item">
      <router-link to="/inspiration" class="back-link mono">&larr; BACK TO INSPIRATION</router-link>

      <div class="detail-hero">
        <h1>{{ item.title }}</h1>
        <div class="hero-meta">
          <span class="difficulty-badge" :class="'diff--' + item.difficulty_level">
            {{ item.difficulty_level === 'beginner' ? '新手' : item.difficulty_level === 'intermediate' ? '进阶' : '高级' }}
          </span>
          <span class="meta-text mono" v-if="item.source_hackathon_name">{{ item.source_hackathon_name }}</span>
          <span class="meta-text mono" v-if="item.team_name">&#x263A; {{ item.team_name }}</span>
          <span class="meta-text mono" v-if="item.prize_won">&#x2606; {{ item.prize_won }}</span>
        </div>
      </div>

      <!-- 注册墙拦截 -->
      <div v-if="isRegWall" class="reg-wall">
        <GlowCard>
          <div class="reg-wall-content">
            <span class="reg-icon">&#x2606;</span>
            <h3>注册 / 登录后即可查看完整灵感内容</h3>
            <p class="reg-desc">
              这篇案例包含详细的技术架构拆解、团队画像分析、项目源码和演示视频。
              注册即同意，解锁全部核心干货。
            </p>
            <div class="reg-teaser" v-if="item.teaser">
              <span class="teaser-label mono">PREVIEW</span>
              <p>{{ item.teaser }}</p>
            </div>
            <div class="reg-actions">
              <router-link to="/login" class="btn btn-outline-glow">SIGN IN</router-link>
              <router-link to="/register" class="btn btn-primary-glow">JOIN NOW</router-link>
            </div>
          </div>
        </GlowCard>
      </div>

      <!-- 完整内容（已登录） -->
      <template v-else>
        <div class="content-area" v-html="renderedContent"></div>
      </template>
    </template>

    <div v-else class="empty-state">
      <p>案例不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { inspirationAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import GlowCard from '@/components/ui/GlowCard.vue'

const route = useRoute()
const auth = useAuthStore()
const item = ref(null)
const loading = ref(true)

const isRegWall = computed(() => !auth.isLoggedIn)

const renderedContent = computed(() => {
  if (!item.value?.full_content) return ''
  return item.value.full_content
    .replace(/## (.+)/g, '<h3 class="content-h3">$1</h3>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
})

onMounted(async () => {
  try {
    const res = await inspirationAPI.getDetail(route.params.slug)
    item.value = res.data
    // API 返回 code=403 表示注册墙触发
    if (res.code === 403) {
      // 保留公开摘要，full_content 为 null
    }
  } catch (e) {
    item.value = {
      id: 1,
      title: '【AI教育】GPT-4打造个性化学习助手 — ETHGlobal冠军拆解',
      slug: route.params.slug,
      summary: 'MIT三人团队在36小时内用GPT-4+LangChain构建AI教育工具，获总冠军。',
      teaser: '他们巧妙的「知识图谱+增量学习」模型设计，让项目在200+参赛作品中脱颖而出。',
      full_content: auth.isLoggedIn ? '## 项目背景\n\nMIT团队「EduAI」凭借「Personalized Learning Companion」项目获得总冠军...\n\n## 技术架构\n\n1. 前端：Next.js + Tailwind CSS\n2. 后端：FastAPI + LangChain\n3. AI引擎：GPT-4 + Claude\n4. 数据层：Neo4j + PostgreSQL' : null,
      source_hackathon_name: 'ETHGlobal 2025',
      team_name: 'EduAI',
      prize_won: '总冠军 + $50,000',
      category_tags: ['AI应用', '教育科技'],
      difficulty_level: 'intermediate',
      like_count: 2340,
      view_count: 15600
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.back-link { display: inline-block; margin-bottom: var(--space-6); font-size: var(--text-sm); color: var(--color-text-tertiary); }
.detail-hero { margin-bottom: var(--space-8); }
.detail-hero h1 { font-size: var(--text-3xl); margin-bottom: var(--space-4); }
.hero-meta { display: flex; gap: var(--space-4); align-items: center; flex-wrap: wrap; }
.difficulty-badge { font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-full); font-family: var(--font-mono); }
.diff--beginner { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.diff--intermediate { background: rgba(249, 115, 22, 0.15); color: var(--color-accent); }
.diff--advanced { background: rgba(239, 68, 68, 0.15); color: var(--color-error); }
.meta-text { font-size: var(--text-sm); color: var(--color-text-secondary); }

/* ── 注册墙 ── */
.reg-wall { margin: var(--space-8) 0; }
.reg-wall-content { text-align: center; padding: var(--space-8); }
.reg-icon { font-size: 3rem; display: block; margin-bottom: var(--space-4); color: var(--color-primary); }
.reg-wall-content h3 { font-size: var(--text-xl); margin-bottom: var(--space-4); }
.reg-desc { color: var(--color-text-secondary); margin-bottom: var(--space-6); max-width: 500px; margin-left: auto; margin-right: auto; }
.reg-teaser { background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-6); text-align: left; }
.teaser-label { font-size: var(--text-xs); color: var(--color-primary); margin-bottom: var(--space-2); display: block; }
.reg-teaser p { font-size: var(--text-sm); color: var(--color-text-secondary); }
.reg-actions { display: flex; justify-content: center; gap: var(--space-4); }

/* ── Content ── */
.content-area { line-height: 1.8; color: var(--color-text-secondary); }
.content-area :deep(.content-h3) { font-size: var(--text-xl); color: var(--color-text-primary); margin-top: var(--space-8); margin-bottom: var(--space-4); }
.content-area :deep(p) { margin-bottom: var(--space-4); }

.skeleton-detail { height: 600px; background: var(--color-bg-secondary); border-radius: var(--radius-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
</style>