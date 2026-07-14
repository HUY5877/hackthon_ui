<template>
  <header class="page-header">
    <div>
      <span v-if="eyebrow" class="page-header__eyebrow mono">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.action" class="page-header__action"><slot name="action" /></div>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-8); margin-bottom: var(--space-10); }
.page-header__eyebrow { display: block; margin-bottom: var(--space-3); color: var(--color-primary); font-size: 11px; font-weight: 700; letter-spacing: 0.11em; }
.page-header h1 { font-size: clamp(2.25rem, 4vw, 3.5rem); letter-spacing: -0.05em; }
.page-header p { max-width: 680px; margin-top: var(--space-4); color: var(--color-text-secondary); font-size: var(--text-lg); }
.page-header__action { flex: 0 0 auto; }
@media (max-width: 640px) {
  .page-header { align-items: flex-start; flex-direction: column; margin-bottom: var(--space-8); }
  .page-header p { font-size: var(--text-base); }
  .page-header__action { width: 100%; }
}
</style>
