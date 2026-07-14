<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="base-button"
    :class="buttonClasses"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href"
    :href="href"
    class="base-button"
    :class="buttonClasses"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
  <button
    v-else
    :type="type"
    class="base-button"
    :class="buttonClasses"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <span :class="{ 'base-button__content--hidden': loading }"><slot /></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  target: { type: String, default: '' },
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const buttonClasses = computed(() => [
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  { 'base-button--block': props.block, 'base-button--disabled': props.disabled }
])
</script>

<style scoped>
.base-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding-inline: var(--space-5);
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  font-weight: 650;
  font-size: var(--text-sm);
  line-height: 1;
  cursor: pointer;
  text-decoration: none;
  transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.base-button:hover {
  text-decoration: none;
  transform: translateY(-1px);
}

.base-button--primary {
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-button--primary:hover {
  background: var(--color-primary-dim);
  border-color: var(--color-primary-dim);
  box-shadow: var(--glow-primary);
}

.base-button--secondary {
  color: var(--color-text-primary);
  background: var(--surface-card);
  border-color: var(--color-border);
}

.base-button--secondary:hover {
  border-color: var(--color-border-active);
  box-shadow: var(--shadow-sm);
}

.base-button--ghost {
  color: var(--color-text-secondary);
  background: transparent;
}

.base-button--ghost:hover {
  color: var(--color-primary-dim);
  background: var(--color-primary-soft);
}

.base-button--sm { min-height: 38px; padding-inline: var(--space-4); }
.base-button--lg { min-height: 50px; padding-inline: var(--space-6); font-size: var(--text-base); }
.base-button--block { width: 100%; }
.base-button--disabled,
.base-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.base-button__spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.base-button__content--hidden { visibility: hidden; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
