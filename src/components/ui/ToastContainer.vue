<template>
  <!-- 使用 Teleport 确保 Toast 始终渲染在 body 根节点，不受父级 overflow 影响 -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <span class="toast-icon">{{ ICONS[toast.type] }}</span>
          <span class="toast-message mono">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()

// 使用 Unicode 符号保持赛博朋克风格
const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 88px; /* header(72px) + 间距 */
  right: 24px;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  min-width: 260px;
  max-width: 360px;
  background: var(--color-bg-secondary);
  border-left: 3px solid;
  border-radius: var(--radius-sm);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.toast--success { border-color: var(--color-success); }
.toast--error   { border-color: var(--color-error); }
.toast--warning { border-color: var(--color-warning); }
.toast--info    { border-color: var(--color-primary); }

.toast-icon { font-size: var(--text-base); flex-shrink: 0; }
.toast--success .toast-icon { color: var(--color-success); }
.toast--error   .toast-icon { color: var(--color-error); }
.toast--warning .toast-icon { color: var(--color-warning); }
.toast--info    .toast-icon { color: var(--color-primary); }

.toast-message { font-size: var(--text-sm); color: var(--color-text-primary); line-height: 1.4; }

/* 从右侧滑入，向右侧滑出 */
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateX(110%); }
.toast-enter-active,
.toast-leave-active { transition: all var(--transition-base); }
.toast-move { transition: transform var(--transition-base); }
</style>
