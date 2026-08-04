<template>
  <section class="admin-page">
    <header class="page-heading">
      <div><p class="page-kicker">ACCESS CONTROL / 01</p><h1>用户权限</h1><p>查看平台成员，并将可信用户提升为管理员。</p></div>
      <div class="member-count" aria-label="用户总数"><strong>{{ pagination.total }}</strong><span>平台成员</span></div>
    </header>

    <div class="control-bar">
      <form class="search-box" @submit.prevent="search">
        <span aria-hidden="true">⌕</span><label class="sr-only" for="admin-user-search">搜索用户</label>
        <input id="admin-user-search" v-model="keyword" type="search" placeholder="搜索用户名或邮箱"><button type="submit">搜索</button>
      </form>
      <button v-if="keyword" type="button" class="clear-filter" @click="clearSearch">清除筛选</button>
    </div>

    <div class="data-panel" :aria-busy="loading">
      <div v-if="error" class="feedback feedback--error" role="alert"><span>{{ error }}</span><button type="button" @click="loadUsers">重新加载</button></div>
      <div v-else-if="loading" class="loading-grid" aria-label="正在加载用户"><span v-for="item in 5" :key="item"></span></div>
      <div v-else-if="!users.length" class="feedback"><strong>没有找到用户</strong><span>尝试更换用户名或邮箱关键词。</span></div>
      <div v-else class="table-scroll">
        <table>
          <thead><tr><th>成员</th><th>角色</th><th>邮箱状态</th><th>加入时间</th><th><span class="sr-only">操作</span></th></tr></thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" :data-test="`user-row-${user.id}`">
              <td><div class="member-cell"><span class="member-avatar">{{ user.username?.[0]?.toUpperCase() || 'U' }}</span><span><strong>{{ user.username }}</strong><small>{{ user.email }}</small></span></div></td>
              <td><span class="role-pill" :class="{ 'role-pill--admin': user.role === 'admin' }">{{ roleLabel(user.role) }}</span></td>
              <td><span class="verified-state" :class="{ 'verified-state--muted': !user.email_verified }"><i></i>{{ user.email_verified ? '已验证' : '未验证' }}</span></td>
              <td class="date-cell">{{ formatDate(user.created_at) }}</td>
              <td class="action-cell">
                <button v-if="user.role !== 'admin'" type="button" class="promote-action" :data-test="`promote-user-${user.id}`" @click="selectedUser = user">设为管理员 <span aria-hidden="true">↗</span></button>
                <span v-else class="locked-label">权限已生效</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <footer v-if="pagination.total_pages > 1" class="pagination">
      <span>第 {{ pagination.page }} / {{ pagination.total_pages }} 页</span>
      <div><button type="button" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button><button type="button" :disabled="pagination.page >= pagination.total_pages" @click="changePage(pagination.page + 1)">下一页</button></div>
    </footer>

    <AdminConfirmDialog :open="Boolean(selectedUser)" title="授予管理员权限？" :description="selectedUser ? `确认将 ${selectedUser.username}（${selectedUser.email}）设为管理员？该用户将可以管理其他用户、内容和爬虫任务。` : ''" confirm-label="确认提升" :busy="promoting" @cancel="selectedUser = null" @confirm="promoteSelected" />
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { adminAPI } from '@/api'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'

const users = ref([])
const keyword = ref('')
const loading = ref(true)
const promoting = ref(false)
const error = ref('')
const selectedUser = ref(null)
const pagination = reactive({ page: 1, page_size: 20, total: 0, total_pages: 0 })

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    const response = await adminAPI.listUsers({ keyword: keyword.value || undefined, page: pagination.page, page_size: pagination.page_size })
    users.value = response.data.items
    Object.assign(pagination, { page: response.data.page, page_size: response.data.page_size, total: response.data.total, total_pages: response.data.total_pages })
  } catch (requestError) {
    error.value = requestError.response?.data?.detail || '用户列表加载失败，请稍后重试。'
  } finally { loading.value = false }
}

function search() { pagination.page = 1; loadUsers() }
function clearSearch() { keyword.value = ''; search() }
function changePage(page) { pagination.page = page; loadUsers() }

async function promoteSelected() {
  if (!selectedUser.value) return
  promoting.value = true
  error.value = ''
  try {
    const response = await adminAPI.promoteUser(selectedUser.value.id)
    const index = users.value.findIndex(user => user.id === selectedUser.value.id)
    if (index !== -1) users.value[index] = response.data
    selectedUser.value = null
  } catch (requestError) {
    error.value = requestError.response?.data?.detail || '权限更新失败，请稍后重试。'
  } finally { promoting.value = false }
}

const roleLabel = role => role === 'admin' ? '管理员' : '普通用户'
function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
onMounted(loadUsers)
</script>

<style scoped>
.admin-page { width: min(100%, 1120px); margin-inline: auto; padding: var(--space-10) var(--layout-gutter) var(--space-16); }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-8); padding-bottom: var(--space-8); border-bottom: 1px solid var(--color-border); }
.page-heading h1 { margin-top: var(--space-2); font-size: clamp(2rem, 4vw, 3.25rem); }
.page-heading > div > p:last-child { max-width: 580px; margin-top: var(--space-3); color: var(--color-text-secondary); }
.page-kicker { color: var(--color-primary); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; letter-spacing: .12em; }
.member-count { min-width: 124px; padding: var(--space-4) var(--space-5); background: var(--color-primary-soft); border-radius: var(--radius-lg); }
.member-count strong { display: block; color: var(--color-primary-dim); font-family: var(--font-display); font-size: var(--text-2xl); line-height: 1; }
.member-count span { color: var(--color-secondary); font-size: var(--text-xs); }
.control-bar { min-height: 78px; display: flex; align-items: center; gap: var(--space-4); }
.search-box { width: min(100%, 440px); min-height: 44px; display: flex; align-items: center; gap: var(--space-3); padding-left: var(--space-4); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-control); }
.search-box:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(36,84,61,.1); }
.search-box > span { color: var(--color-text-tertiary); font-size: 22px; }
.search-box input { min-width: 0; flex: 1; padding-block: 10px; background: none; border: 0; outline: 0; }
.search-box button { align-self: stretch; padding-inline: var(--space-5); color: #fff; background: var(--color-primary); border: 0; border-radius: 0 9px 9px 0; cursor: pointer; }
.clear-filter { color: var(--color-text-secondary); background: none; border: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 4px; }
.data-panel { min-height: 350px; overflow: hidden; background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.table-scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; }
th { padding: var(--space-4) var(--space-5); color: var(--color-text-tertiary); background: #fafbf9; border-bottom: 1px solid var(--color-border); font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em; text-align: left; text-transform: uppercase; white-space: nowrap; }
td { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; } tbody tr:last-child td { border-bottom: 0; } tbody tr:hover { background: #fbfcfa; }
.member-cell { min-width: 230px; display: flex; align-items: center; gap: var(--space-3); }
.member-avatar { width: 38px; height: 38px; display: grid; flex: 0 0 auto; place-items: center; color: var(--color-primary-dim); background: var(--color-primary-soft); border-radius: 12px; font-weight: 750; }
.member-cell strong, .member-cell small { display: block; } .member-cell strong { font-size: var(--text-sm); }
.member-cell small { max-width: 240px; overflow: hidden; color: var(--color-text-tertiary); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.role-pill { display: inline-flex; padding: 4px 9px; color: var(--color-text-secondary); background: var(--surface-muted); border-radius: var(--radius-full); font-size: var(--text-xs); white-space: nowrap; }
.role-pill--admin { color: var(--color-primary-dim); background: var(--color-primary-soft); font-weight: 650; }
.verified-state { display: inline-flex; align-items: center; gap: 7px; color: var(--color-success); font-size: var(--text-sm); white-space: nowrap; }
.verified-state i { width: 7px; height: 7px; background: currentColor; border-radius: 50%; } .verified-state--muted { color: var(--color-text-tertiary); }
.date-cell { color: var(--color-text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
.action-cell { text-align: right; white-space: nowrap; }
.promote-action { padding: 8px 10px; color: var(--color-primary-dim); background: transparent; border: 0; border-radius: var(--radius-sm); font-weight: 650; cursor: pointer; }
.promote-action:hover { background: var(--color-primary-soft); } .locked-label { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.feedback { min-height: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-8); color: var(--color-text-secondary); text-align: center; }
.feedback button { color: var(--color-primary); background: none; border: 0; font-weight: 650; cursor: pointer; } .feedback--error { color: var(--color-error); }
.loading-grid { display: grid; gap: 1px; background: var(--color-border-subtle); }
.loading-grid span { height: 68px; background: linear-gradient(100deg,#fff 20%,#f4f6f3 45%,#fff 70%); background-size: 220% 100%; animation: shimmer 1.2s infinite; }
.pagination { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-5); color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: var(--text-xs); }
.pagination div { display: flex; gap: var(--space-2); } .pagination button { min-height: 38px; padding-inline: var(--space-4); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; } .pagination button:disabled { opacity: .45; cursor: not-allowed; }
@keyframes shimmer { to { background-position: -220% 0; } }
@media (max-width: 720px) { .admin-page { padding-top: var(--space-6); } .page-heading { align-items: flex-start; } .member-count { min-width: 96px; } .control-bar { align-items: stretch; flex-direction: column; justify-content: center; padding-block: var(--space-4); } .search-box { width: 100%; } }
</style>
