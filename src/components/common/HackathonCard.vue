<template>
  <div class="hackathon-card" @click="$emit('click')">
    <GlowCard :hoverable="true">
      <!-- Header -->
      <div class="card-header">
        <span class="platform-badge mono">{{ hackathon.source_platform }}</span>
        <span class="status-badge" :class="'status--' + hackathon.status">
          {{ statusLabel }}
        </span>
      </div>

      <!-- Title -->
      <h4 class="card-title">{{ hackathon.name }}</h4>
      <p class="card-summary">{{ hackathon.summary }}</p>

      <!-- Tags -->
      <div class="card-tags" v-if="hackathon.track_tags?.length">
        <span class="tag" v-for="tag in hackathon.track_tags.slice(0, 4)" :key="tag">
          #{{ tag }}
        </span>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="footer-left">
          <span class="prize mono">{{ hackathon.prize_pool }}</span>
          <span class="location" v-if="hackathon.location">
            &#x2316; {{ hackathon.location }}
          </span>
        </div>
        <div class="footer-right">
          <span class="stat mono">
            &#x22A2; {{ hackathon.external_click_count }}
          </span>
        </div>
      </div>
    </GlowCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GlowCard from '@/components/ui/GlowCard.vue'

const props = defineProps({
  hackathon: { type: Object, required: true }
})

defineEmits(['click'])

const statusLabel = computed(() => ({
  upcoming: '即将开始',
  registering: '报名中',
  ongoing: '进行中',
  ended: '已结束'
}[props.hackathon.status] || props.hackathon.status))
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.status--upcoming {
  background: rgba(124, 58, 237, 0.15);
  color: var(--color-secondary);
}

.status--registering {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.status--ongoing {
  background: rgba(0, 212, 255, 0.15);
  color: var(--color-primary);
}

.status--ended {
  background: rgba(100, 116, 139, 0.15);
  color: var(--color-text-tertiary);
}

.card-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.card-summary {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--space-4);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.tag {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: rgba(0, 212, 255, 0.06);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.prize {
  font-size: var(--text-sm);
  color: var(--color-accent);
  font-weight: 600;
}

.location {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.stat {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>