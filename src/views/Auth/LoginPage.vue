<template>
  <main class="auth-page">
    <section class="auth-story" aria-label="平台介绍">
      <RouterLink to="/" class="auth-story__brand"><span>H</span> HackHub</RouterLink>
      <div class="auth-story__copy">
        <span class="mono">ONE ACCOUNT, MORE CONTEXT</span>
        <h1>让每一次参赛选择，都更有依据。</h1>
        <p>登录后解锁完整案例拆解、个性化赛事推荐和你的长期兴趣画像。</p>
      </div>
      <div class="auth-story__proof"><span>案例复盘</span><span>智能推荐</span><span>参赛工具</span></div>
    </section>

    <section class="auth-panel">
      <div class="auth-panel__inner">
        <RouterLink to="/" class="auth-panel__back">← 返回首页</RouterLink>
        <header><span class="mono">WELCOME BACK</span><h2>登录 HackHub</h2><p>继续浏览适合你的黑客松机会。</p></header>
        <form class="auth-form" @submit.prevent="handleLogin">
          <BaseInput v-model="form.email" label="邮箱" type="email" name="email" autocomplete="email" placeholder="developer@example.com" required />
          <BaseInput v-model="form.password" label="密码" type="password" name="password" autocomplete="current-password" placeholder="输入密码" required minlength="6" />
          <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
          <BaseButton type="submit" block size="lg" :loading="auth.loading">登录</BaseButton>
        </form>
        <p class="auth-switch">还没有账号？<RouterLink to="/register">免费创建账号</RouterLink></p>
        <div class="demo-account"><span class="mono">体验账号</span><code>developer@example.com / 任意 6 位以上密码</code></div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const error = ref('')
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  error.value = ''
  const result = await auth.login(form.email, form.password)
  if (result.success) {
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/'
    router.push(redirect)
  } else error.value = result.error
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - var(--header-height)); display: grid; grid-template-columns: minmax(0, 1fr) minmax(480px, 42%); }
.auth-story { min-height: 680px; display: flex; flex-direction: column; padding: clamp(32px, 5vw, 72px); color: white; background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12), transparent 30%), linear-gradient(145deg, #102f20, #326148); }
.auth-story__brand { display: inline-flex; align-items: center; gap: var(--space-3); width: fit-content; color: white; font: 700 var(--text-lg)/1 var(--font-display); }
.auth-story__brand:hover { color: white; text-decoration: none; }
.auth-story__brand span { width: 34px; height: 34px; display: grid; place-items: center; color: var(--color-primary-dim); background: white; border-radius: 10px; }
.auth-story__copy { max-width: 690px; margin: auto 0; }
.auth-story__copy > span { font-size: 10px; letter-spacing: .12em; opacity: .7; }
.auth-story__copy h1 { margin-top: var(--space-5); font-size: clamp(3rem, 6vw, 5.7rem); line-height: .98; letter-spacing: -.065em; }
.auth-story__copy p { max-width: 600px; margin-top: var(--space-6); color: rgba(255,255,255,.7); font-size: var(--text-lg); }
.auth-story__proof { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.auth-story__proof span { padding: 8px 12px; border: 1px solid rgba(255,255,255,.16); border-radius: var(--radius-full); font-size: var(--text-xs); }
.auth-panel { display: grid; place-items: center; padding: var(--space-10) clamp(24px, 5vw, 72px); background: var(--surface-page); }
.auth-panel__inner { width: 100%; max-width: 430px; }
.auth-panel__back { color: var(--color-text-tertiary); font-size: var(--text-sm); }
.auth-panel header { margin: var(--space-12) 0 var(--space-8); }
.auth-panel header span { color: var(--color-primary); font-size: 10px; letter-spacing: .12em; }
.auth-panel h2 { margin-top: var(--space-3); font-size: var(--text-3xl); }
.auth-panel header p { margin-top: var(--space-2); color: var(--color-text-secondary); }
.auth-form { display: grid; gap: var(--space-5); }
.auth-error { padding: var(--space-3); color: var(--color-error); background: rgba(201,65,54,.08); border: 1px solid rgba(201,65,54,.18); border-radius: var(--radius-control); font-size: var(--text-sm); }
.auth-switch { margin-top: var(--space-6); color: var(--color-text-secondary); font-size: var(--text-sm); text-align: center; }
.auth-switch a { color: var(--color-primary); font-weight: 650; }
.demo-account { display: grid; gap: 4px; margin-top: var(--space-8); padding: var(--space-4); color: var(--color-text-tertiary); background: var(--surface-muted); border-radius: var(--radius-control); text-align: center; }
.demo-account span { color: var(--color-primary); font-size: 10px; }
.demo-account code { font-size: var(--text-xs); word-break: break-all; }
@media (max-width: 900px) { .auth-page { grid-template-columns: 1fr; } .auth-story { min-height: 340px; } .auth-story__copy { margin: var(--space-12) 0; } .auth-story__copy h1 { font-size: clamp(2.5rem, 9vw, 4.5rem); } .auth-panel { min-height: 650px; } }
@media (max-width: 540px) { .auth-story { min-height: 300px; padding: var(--space-8) var(--space-5); } .auth-story__copy p, .auth-story__proof { display: none; } .auth-panel { padding: var(--space-8) var(--space-5); } }
</style>
