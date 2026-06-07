<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg-grid"></div>
      <div class="container hero-content">
        <h1 class="hero-title">
          FIND YOUR NEXT<br />
          <span class="hero-highlight">HACKATHON</span>
        </h1>
        <p class="hero-subtitle mono">
          聚合全网黑客松赛事 · AI 驱动的标准化信息引擎 · 赋能每一位开发者
        </p>
        <div class="hero-actions">
          <router-link to="/hackathons" class="btn btn-primary-glow btn-lg">
            EXPLORE HACKATHONS →
          </router-link>
          <router-link to="/inspiration" class="btn btn-outline-glow btn-lg">
            GET INSPIRED
          </router-link>
        </div>
        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item" v-for="stat in stats" :key="stat.label">
            <span class="stat-value mono">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Hot Hackathons -->
    <section class="container page-section">
      <div class="section-header">
        <h2 class="section-title">&#x2666; 热门赛事</h2>
        <router-link to="/hackathons" class="section-link mono">VIEW ALL →</router-link>
      </div>
      <!-- 加载中：骨架屏 -->
      <div v-if="loading" class="hackathon-grid">
        <SkeletonCard v-for="n in 3" :key="n" />
      </div>
      <!-- 加载完成：真实数据 -->
      <div v-else class="hackathon-grid">
        <HackathonCard
          v-for="h in hotHackathons"
          :key="h.id"
          :hackathon="h"
          @click="$router.push(`/hackathons/${h.slug}`)"
        />
      </div>
    </section>

    <!-- Bento Grid: Feature Showcase -->
    <section class="container page-section">
      <div class="bento-grid">
        <div class="bento-item bento-item--large">
          <GlowCard>
            <h3 class="bento-title">&#x2606; 灵感池</h3>
            <p class="bento-desc">往期获奖案例深度拆解，看看大神们是怎么拿冠军的</p>
            <router-link to="/inspiration" class="bento-link mono">DIVE IN →</router-link>
          </GlowCard>
        </div>
        <div class="bento-item">
          <GlowCard>
            <h3 class="bento-title">&#x265B; Vibecoding</h3>
            <p class="bento-desc">AI 辅助编程教程，零基础也能搭建 MVP</p>
            <router-link to="/empowerment" class="bento-link mono">LEARN →</router-link>
          </GlowCard>
        </div>
        <div class="bento-item">
          <GlowCard>
            <h3 class="bento-title">&#x2666; 猜你适合</h3>
            <p class="bento-desc">基于标签画像的个性化赛事推荐</p>
            <router-link to="/recommendations" class="bento-link mono">DISCOVER →</router-link>
          </GlowCard>
        </div>
      </div>
    </section>

    <!-- For You -->
    <section class="container page-section" v-if="forYou.length">
      <div class="section-header">
        <h2 class="section-title">&#x2666; 猜你适合</h2>
      </div>
      <div class="hackathon-grid">
        <HackathonCard
          v-for="h in forYou"
          :key="h.id"
          :hackathon="h"
          @click="$router.push(`/hackathons/${h.slug}`)"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { hackathonsAPI, recommendationsAPI } from '@/api'
import HackathonCard from '@/components/common/HackathonCard.vue'
import GlowCard from '@/components/ui/GlowCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

const hotHackathons = ref([])
const forYou = ref([])
const loading = ref(true)

const stats = [
  { value: '100+', label: '覆盖数据源' },
  { value: '500+', label: '历史赛事' },
  { value: '50+', label: '案例拆解' },
  { value: '实时', label: '更新频率' }
]

onMounted(async () => {
  try {
    const [hotRes, forYouRes] = await Promise.all([
      hackathonsAPI.getHot(6),
      recommendationsAPI.getForYou(3).catch(() => ({ data: [] }))
    ])
    hotHackathons.value = hotRes.data || []
    forYou.value = forYouRes.data || []
  } catch (e) {
    console.warn('API unavailable, using mock data')
    // Mock fallback
    hotHackathons.value = MOCK_HOT
    forYou.value = MOCK_FOR_YOU
  } finally {
    loading.value = false
  }
})

// Mock data fallback
const MOCK_HOT = [
  { id: 1, name: 'Solana Renaissance Hackathon', slug: 'solana-renaissance', summary: '$1M+ 奖金池', source_platform: 'solana', status: 'ongoing', track_tags: ['Web3', 'DeFi', 'Gaming'], prize_pool: '$1,000,000+', location: '线上', external_click_count: 4100 },
  { id: 2, name: 'AI Hackathon 2026 — 生成式AI创新应用大赛', slug: 'ai-hackathon-2026', summary: '36小时打造AI原生应用', source_platform: 'huodongxing', status: 'registering', track_tags: ['AI', 'Agent', '多模态'], prize_pool: '¥600,000', location: '北京', external_click_count: 1203 },
  { id: 3, name: 'ETHGlobal Sydney 2026', slug: 'ethglobal-sydney', summary: '$150K 奖金池 Web3黑客松', source_platform: 'ethglobal', status: 'registering', track_tags: ['Web3', 'DeFi', 'DAO'], prize_pool: '$150,000', location: 'Sydney', external_click_count: 856 },
]
const MOCK_FOR_YOU = MOCK_HOT.slice(0, 2)
</script>

<style scoped>
/* ── Hero ── */
.hero {
  position: relative;
  padding: var(--space-16) 0;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
}

.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

.hero-content {
  position: relative;
  text-align: center;
  z-index: 1;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: var(--space-6);
  letter-spacing: 0.04em;
}

.hero-highlight {
  color: var(--color-primary);
  text-shadow: var(--glow-primary);
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-10);
  letter-spacing: 0.03em;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-12);
}

.btn-lg {
  padding: var(--space-4) var(--space-8) !important;
  font-size: var(--text-base) !important;
}

/* ── Stats ── */
.hero-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-12);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-1);
}

/* ── Sections ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
}

.section-title {
  font-size: var(--text-2xl);
}

.section-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
}

.hackathon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--space-6);
}

/* ── Bento Grid ── */
.bento-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
}

.bento-item--large {
  grid-row: span 2;
}

.bento-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-3);
}

.bento-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
  line-height: 1.6;
}

.bento-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .hackathon-grid {
    grid-template-columns: 1fr;
  }
  .hero-stats { gap: var(--space-6); }
  .hero-actions { flex-direction: column; align-items: center; }
}
</style>