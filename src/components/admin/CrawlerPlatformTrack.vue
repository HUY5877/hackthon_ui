<template>
  <div class="platform-grid">
    <article v-for="(platform, index) in platforms" :key="platform">
      <span class="index">{{ String(index + 1).padStart(2, '0') }}</span>
      <div><h3>{{ platform }}</h3><p>{{ schedules[platform] || '按需运行' }}</p></div>
      <button type="button" :data-test="`run-platform-${platform}`" :disabled="disabled" @click="$emit('run', platform)">立即爬取 <span>↗</span></button>
    </article>
  </div>
</template>

<script setup>
defineProps({ platforms: { type: Array, default: () => [] }, schedules: { type: Object, default: () => ({}) }, disabled: Boolean })
defineEmits(['run'])
</script>

<style scoped>
.platform-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: var(--space-3); }
article { min-height: 96px; display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: var(--space-3); padding: var(--space-4); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); transition: border-color var(--transition-fast), transform var(--transition-fast); }
article:hover { border-color: var(--color-border-active); transform: translateY(-1px); } .index { color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: 10px; } h3 { font-family: var(--font-mono); font-size: var(--text-sm); letter-spacing: -.01em; } p { color: var(--color-text-tertiary); font-size: var(--text-xs); }
button { padding: 8px 10px; color: var(--color-primary); background: var(--color-primary-soft); border: 0; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 700; cursor: pointer; } button:disabled { opacity: .45; cursor: not-allowed; } button span { margin-left: 3px; }
@media (max-width: 720px) { .platform-grid { grid-template-columns: 1fr; } }
</style>
