<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="auth-logo mono">&larr; HOME</router-link>
        <h2>&#x2300; SIGN IN</h2>
        <p class="mono text-secondary">登录以解锁灵感池完整内容和个性化推荐</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label mono">EMAIL</label>
          <input v-model="form.email" type="email" class="form-input mono" placeholder="developer@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label mono">PASSWORD</label>
          <input v-model="form.password" type="password" class="form-input mono" placeholder="输入密码" required />
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary-glow btn-block" :disabled="auth.loading">
          <span v-if="auth.loading">AUTHENTICATING...</span>
          <span v-else>AUTHENTICATE</span>
        </button>
      </form>

      <div class="auth-footer">
        <span class="text-tertiary">没有账号？</span>
        <router-link to="/register" class="mono">CREATE ACCOUNT →</router-link>
      </div>

      <!-- Demo hint -->
      <div class="demo-hint mono">
        <span>DEMO ACCOUNT</span>
        <code>developer@example.com / any password</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const error = ref('')

const form = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  error.value = ''
  const result = await auth.login(form.email, form.password)
  if (result.success) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.auth-logo {
  display: inline-block;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-6);
}

.auth-header h2 {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2);
}

.auth-form {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

.form-input::placeholder { color: var(--color-text-tertiary); }

.form-error {
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: var(--color-error);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.btn-block {
  width: 100%;
  justify-content: center;
  padding: var(--space-4) !important;
  font-size: var(--text-base) !important;
}

.auth-footer {
  text-align: center;
  margin-top: var(--space-6);
}

.demo-hint {
  margin-top: var(--space-8);
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-align: center;
}

.demo-hint span {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-accent);
  margin-bottom: var(--space-1);
}

.demo-hint code {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  word-break: break-all;
}
</style>