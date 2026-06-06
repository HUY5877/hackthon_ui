<template>
  <div class="page container page-section">
    <div v-if="loading" class="loading-state">
      <div class="skeleton-detail"></div>
    </div>

    <template v-else-if="hackathon">
      <!-- Back -->
      <router-link to="/hackathons" class="back-link mono">&larr; BACK TO HACKATHONS</router-link>

      <!-- Hero -->
      <div class="detail-hero">
        <div class="hero-meta">
          <span class="platform-badge mono">{{ hackathon.source_platform }}</span>
          <span class="status-badge" :class="'status--' + hackathon.status">
            {{ statusLabel }}
          </span>
        </div>
        <h1 class="detail-title">{{ hackathon.name }}</h1>
        <p class="detail-summary">{{ hackathon.summary }}</p>

        <div class="detail-tags" v-if="hackathon.track_tags?.length">
          <span class="tag" v-for="tag in hackathon.track_tags" :key="tag">#{{ tag }}</span>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="info-grid">
        <GlowCard>
          <h4 class="info-label mono">&#x20AC; 奖金池</h4>
          <p class="info-value prize">{{ hackathon.prize_pool }}</p>
        </GlowCard>
        <GlowCard>
          <h4 class="info-label mono">&#x231A; 赛事时间</h4>
          <p class="info-value">
            {{ formatDate(hackathon.event_start) }} — {{ formatDate(hackathon.event_end) }}
          </p>
        </GlowCard>
        <GlowCard>
          <h4 class="info-label mono">&#x2316; 地点</h4>
          <p class="info-value">{{ hackathon.location || '线上' }}</p>
        </GlowCard>
        <GlowCard>
          <h4 class="info-label mono">&#x2263; 形式</h4>
          <p class="info-value">{{ modeLabel }}</p>
        </GlowCard>
        <GlowCard v-if="hackathon.organizer">
          <h4 class="info-label mono">&#x2606; 主办方</h4>
          <p class="info-value">{{ hackathon.organizer }}</p>
        </GlowCard>
        <GlowCard v-if="hackathon.expected_participants">
          <h4 class="info-label mono">&#x263A; 预计人数</h4>
          <p class="info-value">{{ hackathon.expected_participants }}+</p>
        </GlowCard>
      </div>

      <!-- Description -->
      <section class="detail-section" v-if="hackathon.description">
        <h3 class="section-title">&#x25B6; 赛事详情</h3>
        <div class="description-content">{{ hackathon.description }}</div>
      </section>

      <!-- Tech Tags -->
      <section class="detail-section" v-if="hackathon.tech_tags?.length">
        <h3 class="section-title">&#x25B6; 技术栈</h3>
        <div class="tech-tags">
          <span class="tech-tag mono" v-for="tag in hackathon.tech_tags" :key="tag">{{ tag }}</span>
        </div>
      </section>

      <!-- Sponsors -->
      <section class="detail-section" v-if="hackathon.sponsors?.length">
        <h3 class="section-title">&#x25B6; 赞助商</h3>
        <div class="sponsors-list">
          <span class="sponsor mono" v-for="s in hackathon.sponsors" :key="s">{{ s }}</span>
        </div>
      </section>

      <!-- CTA -->
      <div class="cta-bar" v-if="hackathon.registration_url">
        <a
          :href="hackathon.registration_url"
          target="_blank"
          rel="noopener"
          class="btn btn-primary-glow btn-lg"
          @click="handleClick"
        >
          &#x2197; 去官网报名
        </a>
        <span class="cta-hint mono">
          点击后将跳转至主办方官方页面，平台不截留报名动作
        </span>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="empty-state">
      <span class="empty-icon">&#x2316;</span>
      <p>赛事不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { hackathonsAPI } from '@/api'
import GlowCard from '@/components/ui/GlowCard.vue'

const route = useRoute()
const hackathon = ref(null)
const loading = ref(true)

const statusLabel = computed(() => ({
  upcoming: '即将开始', registering: '报名中', ongoing: '进行中', ended: '已结束'
}[hackathon.value?.status] || hackathon.value?.status || ''))

const modeLabel = computed(() => ({
  online: '线上', offline: '线下', hybrid: '线上 + 线下'
}[hackathon.value?.mode] || hackathon.value?.mode || ''))

function formatDate(d) {
  if (!d) return 'TBD'
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function handleClick() {
  try {
    await hackathonsAPI.recordClick(hackathon.value.id)
  } catch (e) { /* silent */ }
}

onMounted(async () => {
  try {
    const res = await hackathonsAPI.getDetail(route.params.slug)
    hackathon.value = res.data
  } catch (e) {
    // Mock fallback
    hackathon.value = {
      id: 1,
      name: 'AI Hackathon 2026 — 生成式AI创新应用大赛',
      slug: route.params.slug,
      description: '聚焦生成式 AI 技术的创新应用大赛。参赛者需使用 GPT-4、Claude、Gemini 等大模型 API，在 36 小时内打造具有商业潜力的 AI 原生应用。',
      summary: '36小时打造AI原生应用！$80,000奖金+投资机构直通车机会。',
      source_platform: 'huodongxing',
      status: 'registering',
      mode: 'hybrid',
      track_tags: ['AI应用', '生成式AI', 'AI Agent', '多模态'],
      tech_tags: ['Python', 'TypeScript', 'OpenAI API', 'LangChain'],
      prize_pool: '¥600,000 CNY',
      location: '北京 + 线上',
      country: 'China',
      organizer: 'AI社区 & 头部VC',
      sponsors: ['OpenAI', 'Anthropic', 'Google Cloud', '阿里云'],
      expected_participants: 800,
      registration_url: '#',
      view_count: 5670,
      external_click_count: 1203
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.detail-hero {
  margin-bottom: var(--space-8);
}

.hero-meta {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.platform-badge {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.status-badge {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
}

.status--registering { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.status--ongoing { background: rgba(0, 212, 255, 0.15); color: var(--color-primary); }
.status--upcoming { background: rgba(124, 58, 237, 0.15); color: var(--color-secondary); }
.status--ended { background: rgba(100, 116, 139, 0.15); color: var(--color-text-tertiary); }

.detail-title {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-4);
}

.detail-summary {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.detail-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: rgba(0, 212, 255, 0.06);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

/* ── Info Grid ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-10);
}

.info-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
}

.info-value {
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.prize {
  color: var(--color-accent);
  font-weight: 700;
  font-family: var(--font-mono);
}

/* ── Sections ── */
.detail-section {
  margin-bottom: var(--space-10);
}

.section-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.description-content {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.tech-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.tech-tag {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.sponsors-list {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.sponsor {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-glow);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
}

/* ── CTA ── */
.cta-bar {
  text-align: center;
  padding: var(--space-10);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-top: var(--space-10);
}

.cta-hint {
  display: block;
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* ── Skeleton ── */
.skeleton-detail {
  height: 600px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@media (max-width: 768px) {
  .info-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>