<template>
  <section class="admin-page">
    <header class="page-heading"><div><p class="kicker">CRAWLER OPS / 03</p><h1>爬虫调度</h1><p>无需等待定时任务，按平台或全量触发，并实时查看执行进度。</p></div><span class="scheduler-state" :class="{ offline: !overview.scheduler_running }"><i></i>{{ overview.scheduler_running ? '定时器运行中' : '定时器未启动' }}</span></header>

    <div class="overview-grid">
      <article class="all-run-card"><div><p>FULL PIPELINE</p><h2>全平台爬取 + 去重</h2><span>依次抓取 {{ overview.platforms.length }} 个来源，完成清洗、持久化和全量去重。</span></div><button type="button" data-test="run-all" :disabled="taskActive" @click="runAll">{{ taskActive ? '任务运行中' : '启动全量任务' }} <b>→</b></button></article>
      <article class="metric"><small>平台来源</small><strong>{{ overview.platforms.length }}</strong><span>已注册爬虫</span></article>
      <article class="metric"><small>定时任务</small><strong>{{ overview.jobs.length }}</strong><span>APScheduler jobs</span></article>
    </div>

    <p v-if="error" class="page-error" role="alert">{{ error }}</p>
    <CrawlerProgress v-if="activeTask" :task="activeTask" />

    <div class="section-heading"><div><p>PLATFORM TRACKS</p><h2>单平台触发</h2></div><span>运行期间会锁定冲突操作</span></div>
    <CrawlerPlatformTrack :platforms="overview.platforms" :schedules="overview.schedules" :disabled="taskActive" @run="runPlatform" />

    <section v-if="overview.recent_runs.length" class="recent"><div class="section-heading"><div><p>RECENT RUNS</p><h2>最近执行</h2></div></div><ul><li v-for="(run, index) in overview.recent_runs.slice(0, 5)" :key="index"><strong>{{ run.platform || 'all' }}</strong><span>{{ run.status }}</span><small>{{ run.elapsed_seconds ? `${run.elapsed_seconds}s` : '' }}</small></li></ul></section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { adminAPI } from '@/api'
import CrawlerProgress from '@/components/admin/CrawlerProgress.vue'
import CrawlerPlatformTrack from '@/components/admin/CrawlerPlatformTrack.vue'

const STORAGE_KEY = 'admin_crawler_task_id'
const overview = reactive({ platforms: [], schedules: {}, scheduler_running: false, jobs: [], recent_runs: [] })
const activeTask = ref(null)
const error = ref('')
let pollTimer = null
const taskActive = computed(() => ['queued', 'running'].includes(activeTask.value?.status))

function clearPoll() { if (pollTimer) { clearTimeout(pollTimer); pollTimer = null } }
function finishPolling() { clearPoll(); localStorage.removeItem(STORAGE_KEY) }
function schedulePoll() { clearPoll(); if (taskActive.value) pollTimer = setTimeout(pollTask, 2000) }

async function pollTask() {
  if (!activeTask.value?.task_id) return
  try {
    const response = await adminAPI.getCrawlerTask(activeTask.value.task_id)
    activeTask.value = response.data
    if (['completed', 'failed'].includes(response.data.status)) finishPolling()
    else schedulePoll()
  } catch (requestError) {
    if (requestError.response?.status === 404) {
      activeTask.value = { ...activeTask.value, status: 'interrupted', phase: 'interrupted', message: '任务已中断：服务重启或任务记录已清理。' }
      finishPolling()
    } else {
      error.value = requestError.response?.data?.detail || '任务进度获取失败，将继续重试。'
      schedulePoll()
    }
  }
}

async function createTask(payload) {
  if (taskActive.value) return
  error.value = ''
  try {
    const response = await adminAPI.createCrawlerTask(payload)
    activeTask.value = response.data
    localStorage.setItem(STORAGE_KEY, response.data.task_id)
    schedulePoll()
  } catch (requestError) { error.value = requestError.response?.data?.detail || '爬虫任务启动失败。' }
}
const runAll = () => createTask({ scope: 'all' })
const runPlatform = platform => createTask({ scope: 'platform', platform })

async function initialize() {
  try { Object.assign(overview, (await adminAPI.getCrawlerOverview()).data) }
  catch (requestError) { error.value = requestError.response?.data?.detail || '爬虫概览加载失败。' }
  const restoredId = localStorage.getItem(STORAGE_KEY)
  if (restoredId) {
    activeTask.value = { task_id: restoredId, scope: 'all', status: 'queued', phase: 'queued', progress: 5, message: '正在恢复任务状态…' }
    await pollTask()
  }
}

onMounted(initialize)
onBeforeUnmount(clearPoll)
</script>

<style scoped>
.admin-page { width: min(100%,1120px); margin-inline: auto; padding: var(--space-10) var(--layout-gutter) var(--space-16); }
.page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-8); padding-bottom: var(--space-8); border-bottom: 1px solid var(--color-border); } .page-heading h1 { margin-top: var(--space-2); font-size: clamp(2rem,4vw,3.25rem); } .page-heading > div > p:last-child { margin-top: var(--space-3); color: var(--color-text-secondary); }
.kicker, .section-heading p, .all-run-card p { color: var(--color-primary); font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: .12em; }
.scheduler-state { display: inline-flex; align-items: center; gap: var(--space-2); padding: 7px 11px; color: var(--color-success); background: #e6f3eb; border-radius: var(--radius-full); font-size: var(--text-xs); white-space: nowrap; } .scheduler-state i { width: 7px; height: 7px; background: currentColor; border-radius: 50%; } .scheduler-state.offline { color: var(--color-warning); background: #fbf0e2; }
.overview-grid { display: grid; grid-template-columns: minmax(0,2fr) 1fr 1fr; gap: var(--space-3); margin-block: var(--space-6); }
.all-run-card { min-height: 170px; display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; padding: var(--space-6); background: var(--color-primary-soft); border: 1px solid #d0dfd5; border-radius: var(--radius-xl); } .all-run-card h2 { margin-top: var(--space-2); } .all-run-card span { display: block; margin-top: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); } .all-run-card button { min-height: 44px; padding-inline: var(--space-5); color: #fff; background: var(--color-primary); border: 0; border-radius: var(--radius-control); font-weight: 700; cursor: pointer; } .all-run-card button:disabled { opacity: .55; cursor: not-allowed; } .all-run-card b { margin-left: var(--space-3); }
.metric { display: flex; flex-direction: column; justify-content: flex-end; padding: var(--space-5); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); } .metric small { color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: 10px; } .metric strong { margin-block: auto var(--space-2); font-size: var(--text-4xl); line-height: 1; } .metric span { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.page-error { margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4); color: var(--color-error); background: #fbe9e7; border-radius: var(--radius-md); }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-4); margin: var(--space-10) 0 var(--space-4); } .section-heading h2 { margin-top: 3px; font-size: var(--text-2xl); } .section-heading > span { color: var(--color-text-tertiary); font-size: var(--text-xs); }
.recent ul { overflow: hidden; background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); list-style: none; } .recent li { display: grid; grid-template-columns: 1fr auto auto; gap: var(--space-4); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border-subtle); } .recent li:last-child { border-bottom: 0; } .recent li strong { font-family: var(--font-mono); font-size: var(--text-sm); } .recent li span, .recent li small { color: var(--color-text-tertiary); font-size: var(--text-xs); }
@media (max-width: 760px) { .admin-page { padding-top: var(--space-6); } .overview-grid { grid-template-columns: 1fr 1fr; } .all-run-card { grid-column: 1 / -1; } .page-heading { align-items: flex-start; } }
</style>
