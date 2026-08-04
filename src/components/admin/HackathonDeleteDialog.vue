<template>
  <Teleport to="body">
    <Transition name="delete-fade">
      <div v-if="open && item" class="delete-layer" @click.self="cancel">
        <section role="dialog" aria-modal="true" aria-labelledby="delete-title" class="delete-card">
          <span class="danger-mark" aria-hidden="true">!</span>
          <p class="kicker">PERMANENT ACTION</p>
          <h2 id="delete-title">永久删除赛事？</h2>
          <p>此操作无法撤销。请输入完整赛事名称以确认：</p>
          <strong>{{ item.name }}</strong>
          <label><span class="sr-only">赛事名称</span><input v-model="confirmName" data-test="delete-confirm-name" autocomplete="off" :placeholder="item.name"></label>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <div class="actions">
            <BaseButton variant="secondary" :disabled="busy" @click="cancel">取消</BaseButton>
            <BaseButton class="delete-action" data-test="delete-submit" :disabled="confirmName !== item.name" :loading="busy" @click="$emit('confirm', confirmName)">永久删除</BaseButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ open: Boolean, item: { type: Object, default: null }, busy: Boolean, error: { type: String, default: '' } })
const emit = defineEmits(['cancel', 'confirm'])
const confirmName = ref('')
function cancel() { confirmName.value = ''; emit('cancel') }
watch(() => props.open, open => { if (!open) confirmName.value = '' })
</script>

<style scoped>
.delete-layer { position: fixed; inset: 0; z-index: var(--z-modal); display: grid; place-items: center; padding: var(--space-5); background: rgba(30,18,15,.48); backdrop-filter: blur(5px); }
.delete-card { width: min(100%, 480px); padding: var(--space-8); background: var(--surface-card); border: 1px solid #ecc9c5; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); }
.danger-mark { width: 48px; height: 48px; display: grid; place-items: center; margin-bottom: var(--space-5); color: var(--color-error); background: #fbe9e7; border-radius: 14px; font-family: var(--font-mono); font-size: var(--text-xl); font-weight: 800; }
.kicker { color: var(--color-error); font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: .12em; }
h2 { margin-top: var(--space-2); } h2 + p { margin-top: var(--space-4); color: var(--color-text-secondary); } strong { display: block; margin-top: var(--space-2); }
label { display: block; margin-top: var(--space-5); } input { width: 100%; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-control); outline: 0; } input:focus { border-color: var(--color-error); box-shadow: 0 0 0 3px rgba(201,65,54,.1); }
.error { margin-top: var(--space-3); color: var(--color-error); font-size: var(--text-sm); }
.actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-8); } .delete-action { background: var(--color-error); border-color: var(--color-error); }
.delete-fade-enter-active, .delete-fade-leave-active { transition: opacity var(--transition-base); } .delete-fade-enter-from, .delete-fade-leave-to { opacity: 0; }
</style>
