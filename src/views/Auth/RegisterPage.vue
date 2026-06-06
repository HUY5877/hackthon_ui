<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="auth-logo mono">&larr; HOME</router-link>
        <h2>&#x2606; JOIN HACKHUB</h2>
        <p class="mono text-secondary">注册即可解锁灵感池完整内容与个性化推荐</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label mono">EMAIL</label>
          <input v-model="form.email" type="email" class="form-input mono" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label mono">USERNAME</label>
          <input v-model="form.username" type="text" class="form-input mono" placeholder="你的昵称" required minlength="2" />
        </div>
        <div class="form-group">
          <label class="form-label mono">PASSWORD</label>
          <input v-model="form.password" type="password" class="form-input mono" placeholder="6位以上密码" required minlength="6" />
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary-glow btn-block" :disabled="auth.loading">
          <span v-if="auth.loading">CREATING...</span>
          <span v-else>CREATE ACCOUNT</span>
        </button>
      </form>

      <div class="auth-footer">
        <span class="text-tertiary">已有账号？</span>
        <router-link to="/login" class="mono">SIGN IN →</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const error = ref('')

const form = reactive({ email: '', username: '', password: '' })

async function handleRegister() {
  error.value = ''
  const result = await auth.register(form.email, form.username, form.password)
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - 72px); display: flex; align-items: center; justify-content: center; padding: var(--space-8); }
.auth-container { width: 100%; max-width: 420px; }
.auth-header { text-align: center; margin-bottom: var(--space-8); }
.auth-logo { display: inline-block; font-size: var(--text-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-6); }
.auth-header h2 { font-size: var(--text-3xl); margin-bottom: var(--space-2); }
.auth-form { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); }
.form-group { margin-bottom: var(--space-5); }
.form-label { display: block; font-size: var(--text-xs); color: var(--color-text-tertiary); margin-bottom: var(--space-2); text-transform: uppercase; letter-spacing: 0.05em; }
.form-input { width: 100%; padding: var(--space-3) var(--space-4); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-primary); font-size: var(--text-base); }
.form-input:focus { border-color: var(--color-primary); outline: none; box-shadow: 0 0 8px rgba(0, 212, 255, 0.2); }
.form-input::placeholder { color: var(--color-text-tertiary); }
.form-error { padding: var(--space-3); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); color: var(--color-error); font-size: var(--text-sm); margin-bottom: var(--space-4); }
.btn-block { width: 100%; justify-content: center; padding: var(--space-4) !important; font-size: var(--text-base) !important; }
.auth-footer { text-align: center; margin-top: var(--space-6); }
</style>