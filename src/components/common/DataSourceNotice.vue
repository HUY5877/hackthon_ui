<template>
  <div v-if="mock" class="data-notice" role="status">
    <span class="data-notice__dot" aria-hidden="true"></span>
    当前接口不可用，页面正在展示演示数据
  </div>
</template>

<script setup>
defineProps({ mock: { type: Boolean, default: false } })
</script>

<style scoped>
.data-notice { display: flex; align-items: center; gap: var(--space-2); padding: 10px 12px; color: #8b4b2e; background: #fff4ed; border: 1px solid #f3d5c6; border-radius: var(--radius-control); font-size: var(--text-xs); }
.data-notice__dot { width: 7px; height: 7px; background: var(--color-accent); border-radius: 50%; }
</style>
