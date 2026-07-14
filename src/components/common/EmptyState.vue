<template>
  <div class="empty-state">
    <span class="empty-state__mark" aria-hidden="true">{{ mark }}</span>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.action" class="empty-state__action"><slot name="action" /></div>
  </div>
</template>

<script setup>
defineProps({
  mark: { type: String, default: 'H' },
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state { min-height: 320px; display: grid; place-content: center; justify-items: center; gap: var(--space-3); padding: var(--space-10); color: var(--color-text-secondary); background: var(--surface-card); border: 1px dashed var(--color-border); border-radius: var(--radius-card); text-align: center; }
.empty-state__mark { width: 52px; height: 52px; display: grid; place-items: center; margin-bottom: var(--space-2); color: var(--color-primary); background: var(--color-primary-soft); border-radius: 14px; font-family: var(--font-display); font-weight: 750; }
.empty-state h3 { color: var(--color-text-primary); font-size: var(--text-xl); }
.empty-state p { max-width: 420px; font-size: var(--text-sm); }
.empty-state__action { margin-top: var(--space-3); }
</style>
