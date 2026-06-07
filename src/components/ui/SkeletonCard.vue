<template>
  <!-- 结构化骨架屏，模拟 HackathonCard 内容布局 -->
  <div class="skeleton-card">
    <!-- 徽章行：平台 + 状态 -->
    <div class="skeleton-row">
      <div class="skeleton-line" style="width:56px;height:20px" />
      <div class="skeleton-line" style="width:48px;height:20px" />
    </div>
    <!-- 标题 -->
    <div class="skeleton-line" style="width:82%;height:20px;margin-top:14px" />
    <!-- 副标题 -->
    <div class="skeleton-line" style="width:56%;height:14px;margin-top:8px" />
    <!-- 标签行 -->
    <div class="skeleton-row" style="margin-top:14px;gap:8px">
      <div class="skeleton-line" style="width:52px;height:22px" />
      <div class="skeleton-line" style="width:52px;height:22px" />
      <div class="skeleton-line" style="width:52px;height:22px" />
    </div>
    <!-- 分隔线 -->
    <div class="skeleton-divider" />
    <!-- 底部信息行 -->
    <div class="skeleton-row" style="justify-content:space-between">
      <div class="skeleton-line" style="width:72px;height:14px" />
      <div class="skeleton-line" style="width:48px;height:14px" />
    </div>
  </div>
</template>

<script setup>
// 无 props，纯展示组件
</script>

<style scoped>
.skeleton-card {
  padding: var(--space-6);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.skeleton-row {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

/* shimmer 流光动画：光带从右向左扫过，比纯 pulse 更真实 */
.skeleton-line {
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    rgba(255, 255, 255, 0.05) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-4) 0;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
