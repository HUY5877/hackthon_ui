<template>
  <section class="admin-page">
    <header class="page-heading"><div><p class="kicker">CONTENT DESK / 02</p><h1>赛事内容</h1><p>核对爬取结果，修订对外展示字段，或永久移除错误记录。</p></div><div class="record-count"><strong>{{ pagination.total }}</strong><span>赛事记录</span></div></header>
    <form class="filters" @submit.prevent="search">
      <input v-model="filters.keyword" type="search" placeholder="搜索赛事名称">
      <input v-model="filters.source_platform" placeholder="来源平台">
      <select v-model="filters.status"><option value="">全部状态</option><option value="upcoming">即将开始</option><option value="registering">报名中</option><option value="ongoing">进行中</option><option value="ended">已结束</option></select>
      <button type="submit">应用筛选</button>
    </form>
    <div class="data-panel" :aria-busy="loading">
      <div v-if="error" class="feedback" role="alert">{{ error }} <button type="button" @click="loadHackathons">重试</button></div>
      <div v-else-if="loading" class="feedback">正在加载赛事记录…</div>
      <div v-else-if="!hackathons.length" class="feedback">没有符合条件的赛事记录。</div>
      <div v-else class="table-scroll">
        <table><thead><tr><th>赛事</th><th>状态 / 方式</th><th>来源</th><th>赛事时间</th><th>操作</th></tr></thead>
          <tbody><tr v-for="item in hackathons" :key="item.id" :data-test="`hackathon-row-${item.id}`">
            <td><div class="event-cell"><strong>{{ item.name }}</strong><small>{{ item.organizer || '主办方待补充' }} · {{ item.location || '地点待补充' }}</small></div></td>
            <td><span class="status">{{ statusLabel(item.status) }}</span><small class="mode">{{ modeLabel(item.mode) }}</small></td>
            <td><strong class="source">{{ item.source_platform }}</strong><small class="source-id">#{{ item.id }}</small></td>
            <td class="date">{{ formatDate(item.event_start) }}</td>
            <td><div class="row-actions"><button type="button" :data-test="`edit-hackathon-${item.id}`" @click="openEdit(item)">编辑</button><button type="button" class="delete" :data-test="`delete-hackathon-${item.id}`" @click="deleteTarget = item">删除</button></div></td>
          </tr></tbody></table>
      </div>
    </div>
    <footer v-if="pagination.total_pages > 1" class="pagination"><span>第 {{ pagination.page }} / {{ pagination.total_pages }} 页</span><div><button :disabled="pagination.page <= 1" @click="changePage(-1)">上一页</button><button :disabled="pagination.page >= pagination.total_pages" @click="changePage(1)">下一页</button></div></footer>

    <HackathonEditDrawer :open="Boolean(editTarget)" :item="editTarget" :saving="saving" @close="editTarget = null" @save="saveEdit" />
    <HackathonDeleteDialog :open="Boolean(deleteTarget)" :item="deleteTarget" :busy="deleting" :error="deleteError" @cancel="closeDelete" @confirm="confirmDelete" />
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { adminAPI } from '@/api'
import HackathonEditDrawer from '@/components/admin/HackathonEditDrawer.vue'
import HackathonDeleteDialog from '@/components/admin/HackathonDeleteDialog.vue'

const hackathons = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const deleteError = ref('')
const editTarget = ref(null)
const deleteTarget = ref(null)
const filters = reactive({ keyword: '', source_platform: '', status: '' })
const pagination = reactive({ page: 1, page_size: 20, total: 0, total_pages: 0 })

async function loadHackathons() {
  loading.value = true; error.value = ''
  try {
    const response = await adminAPI.listHackathons({ keyword: filters.keyword || undefined, source_platform: filters.source_platform || undefined, status: filters.status || undefined, page: pagination.page, page_size: pagination.page_size })
    hackathons.value = response.data.items
    Object.assign(pagination, { page: response.data.page, page_size: response.data.page_size, total: response.data.total, total_pages: response.data.total_pages })
  } catch (requestError) { error.value = requestError.response?.data?.detail || '赛事列表加载失败。' }
  finally { loading.value = false }
}

function search() { pagination.page = 1; loadHackathons() }
function changePage(delta) { pagination.page += delta; loadHackathons() }
async function openEdit(item) {
  try { editTarget.value = (await adminAPI.getHackathon(item.id)).data }
  catch (requestError) { error.value = requestError.response?.data?.detail || '赛事详情加载失败。' }
}
async function saveEdit(changed) {
  saving.value = true
  try {
    const response = await adminAPI.updateHackathon(editTarget.value.id, changed)
    const index = hackathons.value.findIndex(item => item.id === response.data.id)
    if (index !== -1) hackathons.value[index] = response.data
    editTarget.value = null
  } catch (requestError) { error.value = requestError.response?.data?.detail || '赛事保存失败。' }
  finally { saving.value = false }
}
function closeDelete() { deleteTarget.value = null; deleteError.value = '' }
async function confirmDelete(confirmName) {
  deleting.value = true; deleteError.value = ''
  try {
    const id = deleteTarget.value.id
    await adminAPI.deleteHackathon(id, { confirm_name: confirmName })
    hackathons.value = hackathons.value.filter(item => item.id !== id)
    pagination.total = Math.max(0, pagination.total - 1)
    closeDelete()
  } catch (requestError) { deleteError.value = requestError.response?.data?.detail || '赛事删除失败。' }
  finally { deleting.value = false }
}
const statusLabel = status => ({ upcoming: '即将开始', registering: '报名中', ongoing: '进行中', ended: '已结束' }[status] || status)
const modeLabel = mode => ({ online: '线上', offline: '线下', hybrid: '混合' }[mode] || mode)
function formatDate(value) { return value ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)) : '时间待补充' }
onMounted(loadHackathons)
</script>

<style scoped>
.admin-page { width: min(100%,1120px); margin-inline: auto; padding: var(--space-10) var(--layout-gutter) var(--space-16); }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-8); padding-bottom: var(--space-8); border-bottom: 1px solid var(--color-border); }
.page-heading h1 { margin-top: var(--space-2); font-size: clamp(2rem,4vw,3.25rem); } .page-heading > div > p:last-child { margin-top: var(--space-3); color: var(--color-text-secondary); }
.kicker { color: var(--color-primary); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; letter-spacing: .12em; }
.record-count { min-width: 124px; padding: var(--space-4) var(--space-5); background: var(--color-primary-soft); border-radius: var(--radius-lg); } .record-count strong, .record-count span { display: block; } .record-count strong { color: var(--color-primary-dim); font-size: var(--text-2xl); line-height: 1; } .record-count span { color: var(--color-secondary); font-size: var(--text-xs); }
.filters { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: var(--space-3); padding-block: var(--space-5); }
.filters input, .filters select { min-width: 0; padding: 11px 12px; background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-control); outline: 0; } .filters button { padding-inline: var(--space-5); color: #fff; background: var(--color-primary); border: 0; border-radius: var(--radius-control); cursor: pointer; }
.data-panel { min-height: 350px; overflow: hidden; background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); } .table-scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; }
th { padding: var(--space-4) var(--space-5); color: var(--color-text-tertiary); background: #fafbf9; border-bottom: 1px solid var(--color-border); font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
td { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; } tbody tr:last-child td { border-bottom: 0; }
.event-cell { min-width: 250px; } .event-cell strong, .event-cell small, .source, .source-id { display: block; } .event-cell small { max-width: 300px; overflow: hidden; color: var(--color-text-tertiary); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.status { display: inline-block; padding: 4px 9px; color: var(--color-primary-dim); background: var(--color-primary-soft); border-radius: var(--radius-full); font-size: var(--text-xs); } .mode, .source-id { color: var(--color-text-tertiary); font-size: 10px; } .source { color: var(--color-text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); } .date { color: var(--color-text-secondary); font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
.row-actions { display: flex; gap: var(--space-2); } .row-actions button { padding: 7px 10px; color: var(--color-primary); background: transparent; border: 0; border-radius: var(--radius-sm); font-weight: 650; cursor: pointer; } .row-actions button:hover { background: var(--color-primary-soft); } .row-actions .delete { color: var(--color-error); }
.feedback { min-height: 350px; display: grid; place-items: center; color: var(--color-text-secondary); } .feedback button { color: var(--color-primary); background: none; border: 0; cursor: pointer; }
.pagination { display: flex; justify-content: space-between; margin-top: var(--space-5); color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: var(--text-xs); } .pagination div { display: flex; gap: var(--space-2); } .pagination button { padding: 8px 12px; background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-sm); } .pagination button:disabled { opacity: .45; }
@media (max-width: 720px) { .admin-page { padding-top: var(--space-6); } .filters { grid-template-columns: 1fr 1fr; } .filters input:first-child { grid-column: 1 / -1; } }
</style>
