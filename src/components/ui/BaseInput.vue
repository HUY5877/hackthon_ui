<template>
  <label class="base-input" :class="{ 'base-input--error': error }">
    <span v-if="label" class="base-input__label">{{ label }}</span>
    <span class="base-input__control">
      <span v-if="$slots.prefix" class="base-input__prefix"><slot name="prefix" /></span>
      <input
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :name="name"
        :autocomplete="autocomplete"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
        @keydown.enter="$emit('submit')"
      />
      <span v-if="$slots.suffix" class="base-input__suffix"><slot name="suffix" /></span>
    </span>
    <span v-if="error" class="base-input__message">{{ error }}</span>
    <span v-else-if="hint" class="base-input__hint">{{ hint }}</span>
  </label>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  name: { type: String, default: '' },
  autocomplete: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'submit'])
</script>

<style scoped>
.base-input { display: grid; gap: var(--space-2); width: 100%; }
.base-input__label { color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 600; }
.base-input__control {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-inline: var(--space-4);
  color: var(--color-text-secondary);
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.base-input__control:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(36, 84, 61, 0.12); }
.base-input__control input { width: 100%; min-width: 0; color: var(--color-text-primary); background: none; border: 0; outline: 0; }
.base-input__control input::placeholder { color: var(--color-text-tertiary); }
.base-input__prefix,
.base-input__suffix { display: inline-flex; align-items: center; flex: 0 0 auto; }
.base-input__hint,
.base-input__message { font-size: var(--text-xs); }
.base-input__hint { color: var(--color-text-tertiary); }
.base-input__message { color: var(--color-error); }
.base-input--error .base-input__control { border-color: var(--color-error); }
</style>
