<template>
  <div class="page container page-section">
    <div class="page-header">
      <h1>&#x2606; 个人中心</h1>
    </div>

    <div class="profile-grid">
      <!-- Profile Card -->
      <GlowCard>
        <div class="profile-header">
          <div class="avatar">{{ auth.user?.username?.[0]?.toUpperCase() }}</div>
          <div>
            <h3>{{ auth.user?.username }}</h3>
            <p class="mono text-secondary">{{ auth.user?.email }}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-value mono">{{ auth.user?.role || 'Developer' }}</span>
            <span class="stat-label">角色</span>
          </div>
          <div class="stat">
            <span class="stat-value mono">{{ auth.user?.email_verified ? 'YES' : 'NO' }}</span>
            <span class="stat-label">邮箱验证</span>
          </div>
        </div>
      </GlowCard>

      <!-- Profile Tags -->
      <GlowCard>
        <h4 class="card-title">&#x2606; 画像标签</h4>
        <p class="card-desc">完善标签以获得更精准的赛事推荐</p>

        <form @submit.prevent="handleSaveTags" class="tag-form">
          <div class="tag-group">
            <label class="tag-label mono">TECH STACK</label>
            <div class="tag-options">
              <button
                v-for="t in techOptions"
                :key="t"
                type="button"
                class="tag-chip mono"
                :class="{ active: selectedTags.tech_stack?.includes(t) }"
                @click="toggleTag('tech_stack', t)"
              >{{ t }}</button>
            </div>
          </div>
          <div class="tag-group">
            <label class="tag-label mono">INTERESTS</label>
            <div class="tag-options">
              <button
                v-for="i in interestOptions"
                :key="i"
                type="button"
                class="tag-chip mono"
                :class="{ active: selectedTags.interests?.includes(i) }"
                @click="toggleTag('interests', i)"
              >{{ i }}</button>
            </div>
          </div>
          <div class="tag-group">
            <label class="tag-label mono">STATUS</label>
            <div class="tag-options">
              <button
                v-for="s in statusOptions"
                :key="s.value"
                type="button"
                class="tag-chip mono"
                :class="{ active: selectedTags.status === s.value }"
                @click="selectedTags.status = s.value"
              >{{ s.label }}</button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary-glow">SAVE TAGS</button>
          <span v-if="saveMsg" class="save-msg mono">{{ saveMsg }}</span>
        </form>
      </GlowCard>

      <!-- EDM -->
      <GlowCard>
        <h4 class="card-title">&#x25B6; 邮件通知</h4>
        <p class="card-desc">当匹配你画像标签的新赛事上线时，自动发送通知到你的邮箱</p>
        <button
          class="btn"
          :class="auth.user?.edm_subscribed ? 'btn-primary-glow' : 'btn-outline-glow'"
          @click="toggleEDM"
        >
          {{ auth.user?.edm_subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE' }}
        </button>
      </GlowCard>

      <!-- Logout -->
      <div class="logout-section">
        <button class="btn btn-danger" @click="handleLogout">EXIT / LOGOUT</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GlowCard from '@/components/ui/GlowCard.vue'

const router = useRouter()
const auth = useAuthStore()
const saveMsg = ref('')

const selectedTags = reactive({
  tech_stack: [...(auth.user?.profile_tags?.tech_stack || [])],
  interests: [...(auth.user?.profile_tags?.interests || [])],
  status: auth.user?.profile_tags?.status || ''
})

const techOptions = ['Python', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Solidity', 'Rust', 'Go', 'Java', 'Swift']
const interestOptions = ['AI', 'Web3', 'Cloud Native', '游戏开发', '教育科技', 'DevTools', 'IoT', 'FinTech']
const statusOptions = [
  { value: 'student', label: '在校生' },
  { value: 'professional', label: '职场人' },
  { value: 'freelancer', label: '自由职业' }
]

function toggleTag(key, value) {
  const arr = selectedTags[key]
  if (!arr) {
    selectedTags[key] = [value]
    return
  }
  const idx = arr.indexOf(value)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(value)
}

async function handleSaveTags() {
  const result = await auth.updateProfileTags({
    tech_stack: selectedTags.tech_stack,
    interests: selectedTags.interests,
    status: selectedTags.status
  })
  saveMsg.value = result.success ? '保存成功' : '保存失败'
  setTimeout(() => saveMsg.value = '', 2000)
}

async function toggleEDM() {
  await auth.subscribeEDM(!auth.user?.edm_subscribed)
}

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.page-header { margin-bottom: var(--space-8); }

.profile-grid { display: flex; flex-direction: column; gap: var(--space-6); max-width: 700px; }

.profile-header { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); }
.avatar { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: var(--color-text-inverse); border-radius: 50%; font-family: var(--font-display); font-size: var(--text-xl); font-weight: 900; }
.profile-header h3 { font-size: var(--text-xl); margin-bottom: var(--space-1); }

.profile-stats { display: flex; gap: var(--space-8); }
.stat { text-align: center; }
.stat-value { font-size: var(--text-base); color: var(--color-primary); display: block; }
.stat-label { font-size: var(--text-xs); color: var(--color-text-tertiary); }

.card-title { font-size: var(--text-lg); margin-bottom: var(--space-2); }
.card-desc { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-5); }

.tag-form { display: flex; flex-direction: column; gap: var(--space-5); }
.tag-group { }
.tag-label { font-size: var(--text-xs); color: var(--color-text-tertiary); display: block; margin-bottom: var(--space-2); }
.tag-options { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.tag-chip { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-secondary); cursor: pointer; transition: all var(--transition-fast); }
.tag-chip:hover { border-color: var(--color-primary); }
.tag-chip.active { background: rgba(0, 212, 255, 0.1); border-color: var(--color-primary); color: var(--color-primary); }

.save-msg { font-size: var(--text-sm); color: var(--color-success); margin-left: var(--space-4); }

.logout-section { padding-top: var(--space-4); }
.btn-danger { background: transparent; border: 1px solid var(--color-error); color: var(--color-error); padding: var(--space-2) var(--space-5); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: var(--text-sm); cursor: pointer; }
.btn-danger:hover { background: rgba(239, 68, 68, 0.1); }
</style>