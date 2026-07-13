<template>
  <main class="auth-page">
    <section class="auth-story" aria-label="注册权益">
      <RouterLink to="/" class="auth-story__brand"><span>H</span> HackHub</RouterLink>
      <div class="auth-story__copy">
        <span class="mono">JOIN THE BUILDER COMMUNITY</span>
        <h1>从下一场比赛，开始积累你的作品轨迹。</h1>
        <p>一个账号即可解锁完整案例、个性化推荐与长期参赛画像。</p>
      </div>
      <ol class="auth-story__steps"><li><span>01</span>发现合适赛事</li><li><span>02</span>学习获奖案例</li><li><span>03</span>持续完善能力</li></ol>
    </section>

    <section class="auth-panel">
      <div class="auth-panel__inner">
        <RouterLink to="/" class="auth-panel__back">← 返回首页</RouterLink>
        <header><span class="mono">CREATE ACCOUNT</span><h2>加入 HackHub</h2><p>注册免费，仅需一分钟。</p></header>
        <form class="auth-form" @submit.prevent="handleRegister">
          <BaseInput v-model="form.email" label="邮箱" type="email" name="email" autocomplete="email" placeholder="your@email.com" required />
          <BaseInput v-model="form.username" label="用户名" name="username" autocomplete="username" placeholder="你的公开昵称" required minlength="2" />
          <BaseInput v-model="form.password" label="密码" type="password" name="password" autocomplete="new-password" placeholder="至少 6 位" hint="建议组合字母、数字和符号" required minlength="6" />
          <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
          <BaseButton type="submit" block size="lg" :loading="auth.loading">创建账号</BaseButton>
        </form>
        <p class="terms">创建账号即表示你同意平台服务条款与隐私说明。</p>
        <p class="auth-switch">已有账号？<RouterLink to="/login">直接登录</RouterLink></p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const auth = useAuthStore()
const error = ref('')
const form = reactive({ email: '', username: '', password: '' })

async function handleRegister() {
  error.value = ''
  const result = await auth.register(form.email, form.username, form.password)
  if (result.success) router.push('/profile')
  else error.value = result.error
}
</script>

<style scoped>
.auth-page { min-height: calc(100vh - var(--header-height)); display: grid; grid-template-columns: minmax(0, 1fr) minmax(500px, 44%); }
.auth-story { min-height: 720px; display: flex; flex-direction: column; padding: clamp(32px, 5vw, 72px); color: white; background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.12), transparent 30%), linear-gradient(145deg, #172b22, #3c6752); }
.auth-story__brand { display: inline-flex; align-items: center; gap: var(--space-3); width: fit-content; color: white; font: 700 var(--text-lg)/1 var(--font-display); }
.auth-story__brand:hover { color: white; text-decoration: none; }
.auth-story__brand > span { width: 34px; height: 34px; display: grid; place-items: center; color: var(--color-primary-dim); background: white; border-radius: 10px; }
.auth-story__copy { max-width: 720px; margin: auto 0; }
.auth-story__copy > span { font-size: 10px; letter-spacing: .12em; opacity: .7; }
.auth-story__copy h1 { margin-top: var(--space-5); font-size: clamp(3rem, 5.5vw, 5.4rem); line-height: 1; letter-spacing: -.065em; }
.auth-story__copy p { max-width: 580px; margin-top: var(--space-6); color: rgba(255,255,255,.7); font-size: var(--text-lg); }
.auth-story__steps { display: flex; flex-wrap: wrap; gap: var(--space-8); padding: 0; list-style: none; }
.auth-story__steps li { display: grid; gap: 5px; color: rgba(255,255,255,.78); font-size: var(--text-sm); }
.auth-story__steps span { color: rgba(255,255,255,.45); font: 600 10px var(--font-mono); }
.auth-panel { display: grid; place-items: center; padding: var(--space-10) clamp(24px, 5vw, 72px); background: var(--surface-page); }
.auth-panel__inner { width: 100%; max-width: 440px; }
.auth-panel__back { color: var(--color-text-tertiary); font-size: var(--text-sm); }
.auth-panel header { margin: var(--space-10) 0 var(--space-8); }
.auth-panel header span { color: var(--color-primary); font-size: 10px; letter-spacing: .12em; }
.auth-panel h2 { margin-top: var(--space-3); font-size: var(--text-3xl); }
.auth-panel header p { margin-top: var(--space-2); color: var(--color-text-secondary); }
.auth-form { display: grid; gap: var(--space-5); }
.auth-error { padding: var(--space-3); color: var(--color-error); background: rgba(201,65,54,.08); border: 1px solid rgba(201,65,54,.18); border-radius: var(--radius-control); font-size: var(--text-sm); }
.terms { margin-top: var(--space-5); color: var(--color-text-tertiary); font-size: var(--text-xs); text-align: center; }
.auth-switch { margin-top: var(--space-4); color: var(--color-text-secondary); font-size: var(--text-sm); text-align: center; }
.auth-switch a { color: var(--color-primary); font-weight: 650; }
@media (max-width: 900px) { .auth-page { grid-template-columns: 1fr; } .auth-story { min-height: 360px; } .auth-story__copy { margin: var(--space-12) 0; } .auth-story__copy h1 { font-size: clamp(2.5rem, 9vw, 4.5rem); } .auth-panel { min-height: 740px; } }
@media (max-width: 540px) { .auth-story { min-height: 300px; padding: var(--space-8) var(--space-5); } .auth-story__copy p, .auth-story__steps { display: none; } .auth-panel { padding: var(--space-8) var(--space-5); } }
</style>
