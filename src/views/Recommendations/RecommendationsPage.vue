<template>
  <div class="page container page-section">
    <div class="page-header">
      <h1>&#x2666; 推荐</h1>
      <p class="mono text-secondary">全站综合热度榜 + 基于标签画像的个性化推荐</p>
    </div>

    <!-- Hot Rankings -->
    <section class="content-section">
      <h2 class="section-title">&#x2666; 综合热度榜</h2>
      <div class="rank-list">
        <div v-for="(h, idx) in hotRankings" :key="h.id" class="rank-item" @click="$router.push(`/hackathons/${h.slug}`)">
          <GlowCard :hoverable="true">
            <div class="rank-inner">
              <span class="rank-number mono" :class="'rank-' + (idx + 1)">#{{ idx + 1 }}</span>
              <div class="rank-content">
                <h4>{{ h.name }}</h4>
                <p class="rank-summary">{{ h.summary }}</p>
                <div class="rank-meta">
                  <span class="meta-tag mono" v-if="h.source_platform">{{ h.source_platform }}</span>
                  <span class="meta-stat mono">&#x22A2; {{ h.view_count }}</span>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </section>

    <!-- For You -->
    <section class="content-section">
      <h2 class="section-title">&#x2666; 猜你适合</h2>
      <p v-if="!auth.isLoggedIn" class="login-prompt">
        <router-link to="/login">登录</router-link> 并完善画像标签，获取更精准的个性化推荐
      </p>
      <div class="rank-list" v-if="forYou.length">
        <div v-for="(h, idx) in forYou" :key="h.id" class="rank-item" @click="$router.push(`/hackathons/${h.slug}`)">
          <GlowCard :hoverable="true">
            <div class="rank-inner">
              <span class="rank-number mono match-badge">MATCH</span>
              <div class="rank-content">
                <h4>{{ h.name }}</h4>
                <p class="rank-summary">{{ h.summary }}</p>
                <div class="rank-meta">
                  <span class="meta-tag mono" v-if="h.source_platform">{{ h.source_platform }}</span>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
      <div v-else class="empty-hint mono text-tertiary">
        {{ auth.isLoggedIn ? '完善画像标签以获取个性化推荐' : '登录后查看个性化推荐' }}
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { recommendationsAPI } from '@/api'
import { useAuthStore } from '@/stores/auth'
import GlowCard from '@/components/ui/GlowCard.vue'

const auth = useAuthStore()
const hotRankings = ref([])
const forYou = ref([])

onMounted(async () => {
  try {
    const [hotRes, forYouRes] = await Promise.all([
      recommendationsAPI.getHot(10),
      recommendationsAPI.getForYou(5)
    ])
    hotRankings.value = hotRes.data || []
    forYou.value = forYouRes.data || []
  } catch (e) {
    hotRankings.value = [
      { id: 1, name: 'Solana Renaissance Hackathon', slug: 'solana-renaissance', summary: '$1M+ 奖金池·线上', source_platform: 'solana', view_count: 12500 },
      { id: 2, name: 'MLH Global Hack Week — Cloud', slug: 'mlh-cloud', summary: '全球线上黑客周·新手友好', source_platform: 'mlh', view_count: 8900 },
      { id: 3, name: 'AI Hackathon 2026', slug: 'ai-hackathon-2026', summary: '36小时打造AI原生应用', source_platform: 'huodongxing', view_count: 5670 },
      { id: 4, name: 'ETHGlobal Sydney 2026', slug: 'ethglobal-sydney', summary: '$150K·亚太Web3黑客松', source_platform: 'ethglobal', view_count: 3240 },
      { id: 5, name: 'DoraHacks Quantum Leap', slug: 'dorahacks-quantum', summary: '量子计算·$50K', source_platform: 'dorahacks', view_count: 1890 },
    ]
    forYou.value = []
  }
})
</script>

<style scoped>
.page-header { margin-bottom: var(--space-10); }
.page-header h1 { margin-bottom: var(--space-2); }
.content-section { margin-bottom: var(--space-12); }
.section-title { font-size: var(--text-xl); margin-bottom: var(--space-6); padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border); }

.rank-list { display: flex; flex-direction: column; gap: var(--space-4); }
.rank-item { cursor: pointer; }

.rank-inner { display: flex; align-items: center; gap: var(--space-6); }

.rank-number { font-size: var(--text-2xl); font-weight: 900; color: var(--color-text-tertiary); min-width: 60px; }
.rank-1 { color: var(--color-accent); text-shadow: var(--glow-accent); }
.rank-2 { color: var(--color-primary); }
.rank-3 { color: var(--color-secondary); }

.match-badge { font-size: var(--text-sm); color: var(--color-success); background: rgba(16, 185, 129, 0.1); padding: 4px 12px; border-radius: var(--radius-full); border: 1px solid rgba(16, 185, 129, 0.2); }

.rank-content { flex: 1; }
.rank-content h4 { font-size: var(--text-base); margin-bottom: var(--space-1); }
.rank-summary { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }

.rank-meta { display: flex; gap: var(--space-3); }
.meta-tag { font-size: var(--text-xs); color: var(--color-text-tertiary); text-transform: uppercase; }
.meta-stat { font-size: var(--text-xs); color: var(--color-text-tertiary); }

.login-prompt { color: var(--color-text-tertiary); margin-bottom: var(--space-4); font-size: var(--text-sm); }
.login-prompt a { color: var(--color-primary); }
.empty-hint { padding: var(--space-8); text-align: center; }
</style>