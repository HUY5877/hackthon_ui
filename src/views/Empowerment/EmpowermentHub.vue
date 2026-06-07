<template>
  <div class="page container page-section">
    <div class="page-header">
      <h1>&#x265B; 开发者赋能</h1>
      <p class="mono text-secondary">AI 辅助编程教程 · 黑客松软技能指南 · 参赛武器库</p>
    </div>

    <!-- Vibecoding Section -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">&#x25B6; Vibecoding 教程</h2>
        <router-link to="/empowerment/articles?type=vibecoding" class="section-link mono">VIEW ALL →</router-link>
      </div>
      <!-- 加载中：骨架屏 -->
      <div v-if="loading" class="article-grid">
        <SkeletonCard v-for="n in 3" :key="n" />
      </div>
      <div v-else class="article-grid">
        <div v-for="a in vibecodingArticles" :key="a.id" class="article-card" @click="$router.push(`/empowerment/articles/${a.slug}`)">
          <GlowCard>
            <div class="card-sub mono">{{ a.sub_category }}</div>
            <h4 class="card-title">{{ a.title }}</h4>
            <p class="card-summary">{{ a.summary }}</p>
            <div class="card-footer">
              <span class="read-time mono">&#x231A; {{ a.estimated_read_time }}min</span>
              <span class="diff-badge" :class="'diff--' + a.difficulty_level">
                {{ a.difficulty_level === 'beginner' ? '入门' : a.difficulty_level === 'intermediate' ? '进阶' : '高级' }}
              </span>
            </div>
          </GlowCard>
        </div>
      </div>
    </section>

    <!-- Guides Section -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">&#x25B6; 参赛指南</h2>
        <router-link to="/empowerment/articles?type=guide" class="section-link mono">VIEW ALL →</router-link>
      </div>
      <!-- 加载中：骨架屏 -->
      <div v-if="loading" class="article-grid">
        <SkeletonCard v-for="n in 2" :key="n" />
      </div>
      <div v-else class="article-grid">
        <div v-for="a in guideArticles" :key="a.id" class="article-card" @click="$router.push(`/empowerment/articles/${a.slug}`)">
          <GlowCard>
            <div class="card-sub mono">{{ a.sub_category }}</div>
            <h4 class="card-title">{{ a.title }}</h4>
            <p class="card-summary">{{ a.summary }}</p>
            <div class="card-footer">
              <span class="read-time mono">&#x231A; {{ a.estimated_read_time }}min</span>
            </div>
          </GlowCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { empowermentAPI } from '@/api'
import GlowCard from '@/components/ui/GlowCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

const vibecodingArticles = ref([])
const guideArticles = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const [vibeRes, guideRes] = await Promise.all([
      empowermentAPI.getVibecoding(6),
      empowermentAPI.getGuides(6)
    ])
    vibecodingArticles.value = vibeRes.data || []
    guideArticles.value = guideRes.data || []
  } catch (e) {
    // Mock data
    vibecodingArticles.value = [
      { id: 1, title: '【Cursor入门】从零到一：用自然语言构建你的第一个Web应用', slug: 'cursor-first-webapp', sub_category: 'cursor', summary: '不需要写一行代码！30分钟搭建完整Todo List应用。', difficulty_level: 'beginner', estimated_read_time: 15 },
      { id: 2, title: '【GitHub Copilot进阶】加速黑客松MVP开发的10个技巧', slug: 'copilot-advanced', sub_category: 'copilot', summary: '掌握这些技巧，编码速度提升3倍。', difficulty_level: 'intermediate', estimated_read_time: 20 },
      { id: 3, title: '【ChatGPT实战】用GPT-4生成完整的Pitch Deck大纲', slug: 'chatgpt-pitch', sub_category: 'chatgpt', summary: 'AI辅助路演，让你的Pitch脱颖而出。', difficulty_level: 'beginner', estimated_read_time: 12 },
    ]
    guideArticles.value = [
      { id: 4, title: '黑客松组队与参赛全流程科普：从报名到路演', slug: 'hackathon-guide', sub_category: 'process', summary: '一站式指南，覆盖赛前准备到赛后跟进。', estimated_read_time: 25 },
      { id: 5, title: '如何撰写并制作高分路演PPT（Pitch Deck）', slug: 'pitch-deck-guide', sub_category: 'pitch_deck', summary: '评审视角的完整指南，附真实获奖案例。', estimated_read_time: 18 },
    ]
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { margin-bottom: var(--space-10); }
.page-header h1 { margin-bottom: var(--space-2); }

.content-section { margin-bottom: var(--space-12); }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.section-title { font-size: var(--text-xl); }
.section-link { font-size: var(--text-sm); color: var(--color-primary); }

.article-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-6); }
.article-card { cursor: pointer; }

.card-sub { font-size: var(--text-xs); color: var(--color-primary); text-transform: uppercase; margin-bottom: var(--space-2); }
.card-title { font-size: var(--text-base); margin-bottom: var(--space-2); line-height: 1.5; }
.card-summary { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-footer { display: flex; justify-content: space-between; align-items: center; }
.read-time { font-size: var(--text-xs); color: var(--color-text-tertiary); }
.diff-badge { font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-full); font-family: var(--font-mono); }
.diff--beginner { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.diff--intermediate { background: rgba(249, 115, 22, 0.15); color: var(--color-accent); }
.diff--advanced { background: rgba(239, 68, 68, 0.15); color: var(--color-error); }

@media (max-width: 768px) { .article-grid { grid-template-columns: 1fr; } }
</style>