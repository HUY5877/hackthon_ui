<template>
  <div class="glow-card" :class="{ 'glow-card--hoverable': hoverable }">
    <div class="glow-card__content"><slot /></div>
  </div>
</template>

<script setup>
defineProps({
  hoverable: { type: Boolean, default: true }
})
</script>

<style scoped>
.glow-card {
  height: 100%;
  background: var(--surface-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card, var(--shadow-sm));
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.glow-card__content {
  height: 100%;
  padding: var(--space-6);
}

.glow-card--hoverable:hover {
  transform: translateY(-2px);
  border-color: var(--color-border);
  box-shadow: var(--shadow-lg);
}
</style>
