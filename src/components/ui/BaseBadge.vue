<template>
  <span class="base-badge" :class="`base-badge--${tone}`"><slot /></span>
</template>

<script setup>
defineProps({
  tone: { type: String, default: 'neutral' }
})
</script>

<style scoped>
.base-badge {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  padding-inline: 9px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.base-badge--neutral { color: var(--color-text-secondary); background: var(--surface-muted); }
.base-badge--brand { color: var(--color-primary-dim); background: var(--color-primary-soft); }
.base-badge--success { color: var(--color-success); background: rgba(35, 122, 75, 0.1); }
.base-badge--warning { color: #9a4e14; background: rgba(228, 93, 55, 0.11); }
.base-badge--danger { color: var(--color-error); background: rgba(201, 65, 54, 0.1); }
</style>
