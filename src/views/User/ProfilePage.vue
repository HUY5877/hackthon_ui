<template>
  <main class="container page-section profile-page">
    <PageHeader eyebrow="YOUR HACKATHON PROFILE" title="个人中心" description="维护你的技术与兴趣画像，让推荐系统更了解你真正想参加什么。" />

    <div v-if="feedback.message" class="feedback" :class="`feedback--${feedback.type}`" role="status">{{ feedback.message }}</div>

    <div class="profile-layout">
      <aside class="profile-sidebar">
        <section class="identity-card">
          <div class="avatar">{{ initial }}</div>
          <h2>{{ auth.user?.username || 'HackHub Builder' }}</h2>
          <p>{{ auth.user?.email }}</p>
          <BaseBadge :tone="auth.user?.email_verified ? 'success' : 'warning'">{{ auth.user?.email_verified ? '邮箱已验证' : '邮箱待验证' }}</BaseBadge>
          <dl><div><dt>角色</dt><dd>{{ roleLabel }}</dd></div><div><dt>推荐画像</dt><dd>{{ profileCompletion }}%</dd></div></dl>
        </section>
        <BaseButton variant="secondary" block @click="handleLogout">退出登录</BaseButton>
      </aside>

      <div class="profile-content">
        <section class="settings-card">
          <div class="settings-card__heading"><div><span class="mono">MATCHING PROFILE</span><h2>画像标签</h2></div><strong>{{ profileCompletion }}%</strong></div>
          <p class="settings-card__description">选择真实使用的技术和感兴趣的赛道。标签越准确，推荐理由越有参考价值。</p>
          <form class="tag-form" @submit.prevent="handleSaveTags">
            <fieldset><legend>技术栈</legend><p>选择你能用于参赛构建的技能</p><div class="tag-options"><button v-for="tag in techOptions" :key="tag" type="button" :class="{ active: selectedTags.tech_stack.includes(tag) }" :aria-pressed="selectedTags.tech_stack.includes(tag)" @click="toggleTag('tech_stack', tag)">{{ tag }}</button></div></fieldset>
            <fieldset><legend>兴趣赛道</legend><p>选择希望持续关注的问题方向</p><div class="tag-options"><button v-for="tag in interestOptions" :key="tag" type="button" :class="{ active: selectedTags.interests.includes(tag) }" :aria-pressed="selectedTags.interests.includes(tag)" @click="toggleTag('interests', tag)">{{ tag }}</button></div></fieldset>
            <fieldset><legend>当前身份</legend><p>帮助我们判断时间与参赛方式偏好</p><div class="tag-options"><button v-for="status in statusOptions" :key="status.value" type="button" :class="{ active: selectedTags.status === status.value }" :aria-pressed="selectedTags.status === status.value" @click="selectedTags.status = status.value">{{ status.label }}</button></div></fieldset>
            <div class="form-actions"><BaseButton type="submit" :loading="savingTags">保存画像</BaseButton><span>已选择 {{ selectedCount }} 个标签</span></div>
          </form>
        </section>

        <section class="settings-card notification-card">
          <div><span class="mono">EMAIL DIGEST</span><h2>赛事邮件通知</h2><p>当符合你画像的新赛事开放报名时，发送简洁提醒。你可以随时关闭。</p></div>
          <button type="button" class="toggle" :class="{ active: auth.user?.edm_subscribed }" :aria-pressed="Boolean(auth.user?.edm_subscribed)" :disabled="savingEdm" @click="toggleEDM"><span></span><em>{{ auth.user?.edm_subscribed ? '已开启' : '已关闭' }}</em></button>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const auth = useAuthStore()
const savingTags = ref(false)
const savingEdm = ref(false)
const feedback = reactive({ message: '', type: 'success', timer: null })
const selectedTags = reactive({ tech_stack: [], interests: [], status: '' })

const techOptions = ['Python', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Solidity', 'Rust', 'Go', 'Java', 'Swift']
const interestOptions = ['AI', 'Web3', 'Cloud Native', '游戏开发', '教育科技', 'DevTools', 'IoT', 'FinTech']
const statusOptions = [{ value: 'student', label: '在校生' }, { value: 'professional', label: '职场开发者' }, { value: 'freelancer', label: '自由职业' }]
const initial = computed(() => auth.user?.username?.slice(0, 1)?.toUpperCase() || 'H')
const roleLabel = computed(() => auth.user?.role === 'admin' ? '管理员' : '开发者')
const selectedCount = computed(() => selectedTags.tech_stack.length + selectedTags.interests.length + (selectedTags.status ? 1 : 0))
const profileCompletion = computed(() => Math.min(100, Math.round((Math.min(selectedTags.tech_stack.length, 3) / 3 * 45) + (Math.min(selectedTags.interests.length, 3) / 3 * 45) + (selectedTags.status ? 10 : 0))))

function syncTags() {
  selectedTags.tech_stack = [...(auth.user?.profile_tags?.tech_stack || [])]
  selectedTags.interests = [...(auth.user?.profile_tags?.interests || [])]
  selectedTags.status = auth.user?.profile_tags?.status || ''
}
function toggleTag(key, value) { const list = selectedTags[key]; const index = list.indexOf(value); index >= 0 ? list.splice(index, 1) : list.push(value) }
function showFeedback(message, type = 'success') { clearTimeout(feedback.timer); feedback.message = message; feedback.type = type; feedback.timer = setTimeout(() => { feedback.message = '' }, 2800) }

async function handleSaveTags() {
  savingTags.value = true
  const result = await auth.updateProfileTags({ tech_stack: selectedTags.tech_stack, interests: selectedTags.interests, status: selectedTags.status })
  savingTags.value = false
  showFeedback(result.success ? '画像标签已保存，后续推荐会使用新偏好。' : result.error || '画像保存失败，请稍后重试。', result.success ? 'success' : 'error')
}
async function toggleEDM() {
  savingEdm.value = true
  const next = !auth.user?.edm_subscribed
  const result = await auth.subscribeEDM(next)
  savingEdm.value = false
  showFeedback(result.success ? `邮件通知已${next ? '开启' : '关闭'}。` : result.error || '设置更新失败，请稍后重试。', result.success ? 'success' : 'error')
}
function handleLogout() { auth.logout(); router.push('/') }

onMounted(async () => { await auth.refreshProfile(); syncTags() })
</script>

<style scoped>
.profile-page { padding-bottom: var(--space-20); }
.feedback { position: fixed; z-index: var(--z-toast); top: calc(var(--header-height) + var(--space-4)); right: var(--layout-gutter); max-width: 420px; padding: var(--space-3) var(--space-4); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-control); box-shadow: var(--shadow-lg); font-size: var(--text-sm); }
.feedback--success { color: var(--color-success); border-color: rgba(35,122,75,.25); }.feedback--error { color: var(--color-error); border-color: rgba(201,65,54,.25); }
.profile-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: var(--space-8); align-items: start; }
.profile-sidebar { position: sticky; top: calc(var(--header-height) + var(--space-6)); display: grid; gap: var(--space-4); }
.identity-card, .settings-card { background: var(--surface-card); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-card); }
.identity-card { padding: var(--space-6); text-align: center; }
.avatar { width: 72px; height: 72px; display: grid; place-items: center; margin: 0 auto var(--space-4); color: white; background: var(--color-primary); border-radius: 20px; font: 700 var(--text-2xl)/1 var(--font-display); }
.identity-card h2 { font-size: var(--text-xl); }.identity-card > p { margin: var(--space-1) 0 var(--space-4); color: var(--color-text-tertiary); font-size: var(--text-xs); word-break: break-all; }
.identity-card dl { display: grid; grid-template-columns: 1fr 1fr; margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border-subtle); }
.identity-card dl > div { display: grid; gap: 4px; }.identity-card dl > div + div { border-left: 1px solid var(--color-border-subtle); }.identity-card dt { color: var(--color-text-tertiary); font-size: 10px; }.identity-card dd { font-weight: 650; font-size: var(--text-sm); }
.profile-content { display: grid; gap: var(--space-6); }.settings-card { padding: var(--space-8); }
.settings-card__heading { display: flex; justify-content: space-between; gap: var(--space-6); }.settings-card__heading span, .notification-card > div > span { color: var(--color-primary); font-size: 10px; letter-spacing: .1em; }.settings-card__heading h2, .notification-card h2 { margin-top: var(--space-2); font-size: var(--text-2xl); }.settings-card__heading > strong { color: var(--color-primary); font: 700 var(--text-2xl)/1 var(--font-display); }
.settings-card__description, .notification-card p { max-width: 680px; margin-top: var(--space-3); color: var(--color-text-secondary); font-size: var(--text-sm); }
.tag-form { display: grid; gap: var(--space-8); margin-top: var(--space-8); }.tag-form fieldset { padding: 0; border: 0; }.tag-form legend { font-weight: 650; }.tag-form fieldset > p { margin-top: 3px; color: var(--color-text-tertiary); font-size: var(--text-xs); }.tag-options { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-4); }.tag-options button { min-height: 38px; padding: 7px 13px; color: var(--color-text-secondary); background: var(--surface-muted); border: 1px solid transparent; border-radius: var(--radius-full); cursor: pointer; font-size: var(--text-sm); transition: all var(--transition-fast); }.tag-options button:hover { border-color: var(--color-border-active); }.tag-options button.active { color: var(--color-primary-dim); background: var(--color-primary-soft); border-color: rgba(36,84,61,.2); font-weight: 650; }
.form-actions { display: flex; align-items: center; gap: var(--space-4); padding-top: var(--space-6); border-top: 1px solid var(--color-border-subtle); }.form-actions > span { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.notification-card { display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); }.toggle { display: flex; align-items: center; gap: var(--space-3); flex: 0 0 auto; color: var(--color-text-tertiary); background: none; border: 0; cursor: pointer; }.toggle > span { position: relative; width: 48px; height: 28px; background: var(--color-border); border-radius: var(--radius-full); transition: background var(--transition-fast); }.toggle > span::after { content: ''; position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; background: white; border-radius: 50%; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast); }.toggle.active > span { background: var(--color-primary); }.toggle.active > span::after { transform: translateX(20px); }.toggle em { font-style: normal; font-size: var(--text-sm); }
@media (max-width: 840px) { .profile-layout { grid-template-columns: 1fr; } .profile-sidebar { position: static; } .identity-card { text-align: left; } .avatar { margin-inline: 0; } }
@media (max-width: 600px) { .settings-card { padding: var(--space-5); } .notification-card { align-items: flex-start; flex-direction: column; } .form-actions { align-items: stretch; flex-direction: column; } }
</style>
