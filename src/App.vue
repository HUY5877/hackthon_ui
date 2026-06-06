<template>
  <div class="app-root">
    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="app-footer">
      <div class="container">
        <span class="mono text-tertiary">&copy; 2026 黑客松信息聚合平台 · Built for Developers</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 72px; /* header height */
}

.app-footer {
  padding: var(--space-8) 0;
  border-top: 1px solid var(--color-border);
  text-align: center;
  margin-top: var(--space-16);
}

/* ── Page Transitions ── */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>