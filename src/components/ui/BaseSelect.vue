<template>
  <label class="base-select">
    <span v-if="label" class="base-select__label">{{ label }}</span>
    <span class="base-select__control">
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <slot />
      </select>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.base-select { display: grid; gap: var(--space-2); }
.base-select__label { color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 600; }
.base-select__control {
  min-height: 44px;
  display: flex;
  align-items: center;
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.base-select__control:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(36, 84, 61, 0.12); }
.base-select select { width: 100%; padding: 10px 36px 10px 14px; color: var(--color-text-primary); background: transparent; border: 0; outline: 0; cursor: pointer; }
</style>
