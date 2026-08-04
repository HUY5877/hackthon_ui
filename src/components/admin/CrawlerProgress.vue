<template>
  <section class="progress-card" aria-live="polite">
    <header><div><p>ACTIVE RUN</p><h2>{{ title }}</h2></div><strong>{{ task.progress || 0 }}%</strong></header>
    <div class="progress-track" role="progressbar" :aria-valuenow="task.progress || 0" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${task.progress || 0}%` }"></span></div>
    <div class="run-meta">
      <span><small>阶段</small>{{ phaseLabel(task.phase) }}</span>
      <span><small>当前平台</small>{{ task.current_platform || task.platform || '准备中' }}</span>
      <span><small>平台进度</small>{{ task.total_platforms ? `${task.completed_platforms || 0} / ${task.total_platforms}` : '—' }}</span>
      <span><small>状态</small>{{ statusLabel(task.status) }}</span>
    </div>
    <p class="run-message" :class="{ 'run-message--error': task.status === 'failed' || task.status === 'interrupted' }">{{ task.error || task.message }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ task: { type: Object, required: true } })
const title = computed(() => props.task.scope === 'all' ? '全平台爬取' : `${props.task.platform || '单平台'} 爬取`)
const phaseLabel = phase => ({ queued: '等待执行', fetching: '抓取页面', cleaning: '清洗内容', persisting: '写入数据库', saving: '保存结果', deduplicating: '全量去重', completed: '执行完成', failed: '执行失败', interrupted: '任务中断' }[phase] || phase || '准备中')
const statusLabel = status => ({ queued: '排队中', running: '运行中', completed: '已完成', failed: '失败', interrupted: '已中断' }[status] || status)
</script>

<style scoped>
.progress-card { padding: var(--space-6); color: #eaf0ec; background: #173326; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); }
header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-5); } header p { color: #8eaa99; font-family: var(--font-mono); font-size: 10px; letter-spacing: .12em; } header h2 { margin-top: 3px; } header > strong { color: #c5e5d0; font-family: var(--font-mono); font-size: var(--text-3xl); line-height: 1; }
.progress-track { height: 10px; overflow: hidden; margin-top: var(--space-6); background: rgba(255,255,255,.1); border-radius: var(--radius-full); } .progress-track span { height: 100%; display: block; background: linear-gradient(90deg,#70bb87,#d1e7d8); border-radius: inherit; transition: width .35s ease; }
.run-meta { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--space-3); margin-top: var(--space-5); } .run-meta span { padding: var(--space-3); background: rgba(255,255,255,.055); border-radius: var(--radius-md); font-size: var(--text-sm); } .run-meta small { display: block; margin-bottom: 2px; color: #88a092; font-family: var(--font-mono); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
.run-message { margin-top: var(--space-4); color: #b8c9bf; font-size: var(--text-sm); } .run-message--error { color: #ffb6af; }
@media (max-width: 680px) { .run-meta { grid-template-columns: 1fr 1fr; } }
</style>
