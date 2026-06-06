<template>
  <div class="glow-card" :class="{ 'glow-card--hoverable': hoverable }">
    <div class="glow-card__border"></div>
    <div class="glow-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  hoverable: { type: Boolean, default: true }
})
</script>

<style scoped>
.glow-card {
  position: relative;
  background: var(--color-bg-glass);
  border-radius: var(--radius-lg);
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all var(--transition-base);
}

.glow-card__border {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(0, 212, 255, 0.15),
    rgba(124, 58, 237, 0.1),
    rgba(0, 212, 255, 0.05)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.glow-card__content {
  position: relative;
  padding: var(--space-6);
  z-index: 1;
}

.glow-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
}

.glow-card--hoverable:hover .glow-card__border {
  background: linear-gradient(
    135deg,
    rgba(0, 212, 255, 0.35),
    rgba(124, 58, 237, 0.2),
    rgba(0, 212, 255, 0.1)
  );
}
</style>