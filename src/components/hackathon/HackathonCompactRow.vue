<template>
  <RouterLink :to="`/hackathons/${hackathon.slug}`" class="compact-row">
    <span class="compact-row__mark" aria-hidden="true">{{ initial }}</span>
    <span class="compact-row__content">
      <strong>{{ hackathon.name }}</strong>
      <small>{{ hackathon.location || '线上' }} · {{ hackathon.source_platform || 'HackHub' }}</small>
    </span>
    <span v-if="match" class="compact-row__match mono">{{ match }}%</span>
    <span v-else class="compact-row__arrow" aria-hidden="true">→</span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hackathon: { type: Object, required: true },
  match: { type: Number, default: 0 }
})

const initial = computed(() => (props.hackathon.source_platform || props.hackathon.name || 'H').slice(0, 1).toUpperCase())
</script>

<style scoped>
.compact-row { min-height: 76px; display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: var(--space-4); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border-subtle); }
.compact-row:last-child { border-bottom: 0; }
.compact-row:hover { color: inherit; text-decoration: none; }
.compact-row__mark { width: 48px; height: 48px; display: grid; place-items: center; color: white; background: var(--color-primary); border-radius: 10px; font-family: var(--font-display); font-size: var(--text-lg); font-weight: 750; }
.compact-row__content { min-width: 0; display: grid; gap: 3px; }
.compact-row__content strong { overflow: hidden; color: var(--color-text-primary); font-size: var(--text-sm); text-overflow: ellipsis; white-space: nowrap; }
.compact-row__content small { overflow: hidden; color: var(--color-text-tertiary); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.compact-row__match { min-width: 52px; padding: 4px 7px; color: var(--color-primary-dim); background: var(--color-primary-soft); border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-align: center; }
.compact-row__arrow { color: var(--color-text-tertiary); }
</style>
