<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="open" class="dialog-layer" @click.self="$emit('cancel')">
        <section class="dialog-card" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <div class="dialog-mark" :class="{ 'dialog-mark--danger': danger }" aria-hidden="true">{{ danger ? '!' : '↑' }}</div>
          <p class="dialog-kicker">需要确认</p>
          <h2 :id="titleId">{{ title }}</h2>
          <p class="dialog-copy">{{ description }}</p>
          <div class="dialog-actions">
            <BaseButton variant="secondary" data-test="confirm-cancel" :disabled="busy" @click="$emit('cancel')">取消</BaseButton>
            <BaseButton data-test="confirm-submit" :loading="busy" :class="{ 'danger-action': danger }" @click="$emit('confirm')">{{ confirmLabel }}</BaseButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useId } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  confirmLabel: { type: String, default: '确认' },
  busy: { type: Boolean, default: false },
  danger: { type: Boolean, default: false }
})
defineEmits(['cancel', 'confirm'])
const titleId = `admin-dialog-${useId()}`
</script>

<style scoped>
.dialog-layer { position: fixed; inset: 0; z-index: var(--z-modal); display: grid; place-items: center; padding: var(--space-5); background: rgba(15, 29, 21, 0.44); backdrop-filter: blur(5px); }
.dialog-card { width: min(100%, 440px); padding: var(--space-8); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); }
.dialog-mark { width: 48px; height: 48px; display: grid; place-items: center; margin-bottom: var(--space-6); color: var(--color-primary-dim); background: var(--color-primary-soft); border-radius: 14px; font-family: var(--font-mono); font-size: var(--text-xl); font-weight: 750; }
.dialog-mark--danger { color: var(--color-error); background: #fbe9e7; }
.dialog-kicker { margin-bottom: var(--space-2); color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: var(--text-xs); letter-spacing: 0.1em; text-transform: uppercase; }
.dialog-card h2 { font-size: var(--text-2xl); }
.dialog-copy { margin-top: var(--space-4); color: var(--color-text-secondary); }
.dialog-actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-8); }
.danger-action { background: var(--color-error); border-color: var(--color-error); }
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity var(--transition-base); }
.dialog-fade-enter-active .dialog-card, .dialog-fade-leave-active .dialog-card { transition: transform var(--transition-base), opacity var(--transition-base); }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
.dialog-fade-enter-from .dialog-card, .dialog-fade-leave-to .dialog-card { opacity: 0; transform: translateY(12px) scale(0.98); }
</style>
