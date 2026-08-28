<template>
  <section
    class="progress-card"
    :class="{
      'progress-card--live': isActive,
      'progress-card--complete': task.status === 'completed',
      'progress-card--failed': ['failed', 'interrupted'].includes(task.status)
    }"
    data-test="crawler-motion"
    aria-live="polite"
  >
    <div v-if="isActive" class="scan-beam" aria-hidden="true"></div>

    <header class="run-header">
      <div>
        <p class="run-kicker">
          <span v-if="isActive" class="live-beacon" aria-hidden="true"><i></i></span>
          {{ isActive ? 'LIVE PROCESS' : 'LAST PROCESS' }}
        </p>
        <h2>{{ title }}</h2>
      </div>
      <div class="progress-readout">
        <small>{{ statusLabel(task.status) }}</small>
        <strong>{{ progress }}<sup>%</sup></strong>
      </div>
    </header>

    <div class="pipeline" :style="{ '--progress': `${progress}%` }">
      <div
        class="progress-track"
        role="progressbar"
        :aria-label="`${title}进度`"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span class="progress-fill">
          <i v-if="isActive" class="data-packet data-packet--one" aria-hidden="true"></i>
          <i v-if="isActive" class="data-packet data-packet--two" aria-hidden="true"></i>
          <i v-if="isActive" class="data-packet data-packet--three" aria-hidden="true"></i>
          <i v-if="isActive" class="progress-head" aria-hidden="true"></i>
        </span>
      </div>

      <ol class="phase-rail" aria-label="执行阶段">
        <li
          v-for="(phase, index) in phases"
          :key="phase.id"
          :class="{
            'phase--done': index < currentPhaseIndex,
            'phase--current': index === currentPhaseIndex
          }"
        >
          <i aria-hidden="true"></i>
          <span>{{ phase.label }}</span>
        </li>
      </ol>
    </div>

    <div class="run-meta">
      <span><small>阶段</small>{{ phaseLabel(task.phase) }}</span>
      <span class="platform-meta"><small>当前平台</small><b>{{ task.current_platform || task.platform || '准备中' }}</b></span>
      <span><small>平台进度</small>{{ task.total_platforms ? `${task.completed_platforms || 0} / ${task.total_platforms}` : '—' }}</span>
      <span><small>状态</small>{{ statusLabel(task.status) }}</span>
    </div>

    <footer class="run-footer">
      <p class="run-message" :class="{ 'run-message--error': ['failed', 'interrupted'].includes(task.status) }">
        <span v-if="isActive" class="activity-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        {{ task.error || task.message || '等待任务状态更新' }}
      </p>
      <code v-if="task.task_id">RUN / {{ task.task_id.slice(0, 8).toUpperCase() }}</code>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ task: { type: Object, required: true } })

const title = computed(() => props.task.scope === 'all' ? '全平台爬取' : `${props.task.platform || '单平台'} 爬取`)
const progress = computed(() => Math.min(100, Math.max(0, Number(props.task.progress) || 0)))
const isActive = computed(() => ['queued', 'running'].includes(props.task.status))

const phases = computed(() => {
  const common = [
    { id: 'queued', label: '排队' },
    { id: 'fetching', label: '抓取' },
    { id: 'cleaning', label: '清洗' },
    { id: 'persisting', label: '入库' }
  ]
  common.push(props.task.scope === 'all'
    ? { id: 'deduplicating', label: '去重' }
    : { id: 'saving', label: '收尾' })
  common.push({ id: 'completed', label: '完成' })
  return common
})

const currentPhaseIndex = computed(() => {
  if (props.task.status === 'completed') return phases.value.length - 1
  const exactIndex = phases.value.findIndex(phase => phase.id === props.task.phase)
  if (exactIndex >= 0) return exactIndex
  return Math.min(
    phases.value.length - 1,
    Math.floor((progress.value / 100) * (phases.value.length - 1))
  )
})

const phaseLabel = phase => ({ queued: '等待执行', fetching: '抓取页面', cleaning: '清洗内容', persisting: '写入数据库', saving: '保存结果', deduplicating: '全量去重', completed: '执行完成', failed: '执行失败', interrupted: '任务中断' }[phase] || phase || '准备中')
const statusLabel = status => ({ queued: '排队中', running: '运行中', completed: '已完成', failed: '失败', interrupted: '已中断' }[status] || status || '准备中')
</script>

<style scoped>
.progress-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(24px, 4vw, 36px);
  color: #eaf0ec;
  background:
    radial-gradient(circle at 92% 0%, rgba(130, 210, 158, .12), transparent 26%),
    linear-gradient(rgba(255, 255, 255, .022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .022) 1px, transparent 1px),
    #143428;
  background-size: auto, 28px 28px, 28px 28px, auto;
  border: 1px solid rgba(197, 229, 208, .08);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.progress-card--complete { background-color: #18392c; }
.progress-card--failed { background-color: #402720; }
.scan-beam { position: absolute; z-index: -1; inset: 0 auto 0 -28%; width: 28%; background: linear-gradient(90deg, transparent, rgba(160, 231, 184, .075), transparent); transform: skewX(-12deg); animation: scanCard 4.2s ease-in-out infinite; }

.run-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-5); }
.run-kicker { display: flex; align-items: center; gap: 8px; color: #8eaa99; font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: .16em; }
.run-header h2 { margin-top: 5px; color: #f4f7f5; font-size: clamp(1.65rem, 3vw, 2.25rem); letter-spacing: -.035em; }
.live-beacon { width: 10px; height: 10px; display: grid; place-items: center; border: 1px solid rgba(146, 222, 170, .42); border-radius: 50%; }
.live-beacon i { width: 4px; height: 4px; background: #91dbaa; border-radius: 50%; box-shadow: 0 0 12px #91dbaa; animation: beacon 1.5s ease-in-out infinite; }
.progress-readout { display: grid; justify-items: end; }
.progress-readout small { color: #8eaa99; font: 700 9px/1 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; }
.progress-readout strong { color: #c9efd6; font: 700 clamp(2rem, 4vw, 3rem)/.9 var(--font-mono); letter-spacing: -.06em; }
.progress-readout sup { margin-left: 2px; font-size: .46em; vertical-align: top; }

.pipeline { margin-top: var(--space-6); }
.progress-track { height: 12px; overflow: hidden; background: rgba(255, 255, 255, .095); border: 1px solid rgba(255, 255, 255, .04); border-radius: var(--radius-full); }
.progress-fill { position: relative; width: var(--progress); height: 100%; display: block; overflow: hidden; background: linear-gradient(90deg, #68b983, #bfe3cc); border-radius: inherit; box-shadow: 0 0 24px rgba(126, 205, 151, .18); transition: width .7s cubic-bezier(.22, 1, .36, 1); }
.data-packet { position: absolute; top: 2px; left: -12px; width: 18px; height: 6px; background: rgba(255, 255, 255, .9); border-radius: var(--radius-full); filter: blur(.2px); animation: packetFlow 2.6s linear infinite; }
.data-packet--two { animation-delay: -.85s; opacity: .68; }
.data-packet--three { animation-delay: -1.7s; opacity: .42; }
.progress-head { position: absolute; top: 50%; right: 4px; width: 5px; height: 5px; background: #f5fff8; border-radius: 50%; box-shadow: 0 0 0 5px rgba(245, 255, 248, .14), 0 0 18px #d4f4df; transform: translateY(-50%); animation: headPulse 1.2s ease-out infinite; }

.phase-rail { display: grid; grid-template-columns: repeat(6, 1fr); margin-top: 12px; color: rgba(217, 230, 222, .42); list-style: none; }
.phase-rail li { position: relative; display: grid; gap: 5px; font: 600 9px/1 var(--font-mono); letter-spacing: .08em; }
.phase-rail li:not(:last-child)::after { content: ''; position: absolute; top: 3px; left: 8px; width: calc(100% - 10px); height: 1px; background: rgba(255, 255, 255, .08); }
.phase-rail i { width: 7px; height: 7px; position: relative; z-index: 1; background: #405f50; border: 2px solid #28483a; border-radius: 50%; }
.phase-rail .phase--done, .phase-rail .phase--current { color: #cbe8d5; }
.phase-rail .phase--done i { background: #72bd8a; }
.phase-rail .phase--current i { background: #e8fff0; box-shadow: 0 0 0 4px rgba(139, 215, 164, .16), 0 0 14px rgba(139, 215, 164, .7); }

.run-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-top: var(--space-6); }
.run-meta > span { min-width: 0; padding: var(--space-3); background: rgba(255, 255, 255, .055); border: 1px solid rgba(255, 255, 255, .025); border-radius: var(--radius-md); font-size: var(--text-sm); }
.run-meta small { display: block; margin-bottom: 3px; color: #88a092; font-family: var(--font-mono); font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
.platform-meta b { color: #bdf0ce; font-family: var(--font-mono); font-weight: 700; }
.progress-card--live .platform-meta { animation: metaBreath 2.4s ease-in-out infinite; }

.run-footer { min-height: 28px; display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-4); margin-top: var(--space-4); }
.run-message { display: flex; align-items: center; gap: 9px; color: #b8c9bf; font-size: var(--text-sm); }
.run-message--error { color: #ffb6af; }
.run-footer code { color: rgba(186, 211, 196, .42); font: 9px/1 var(--font-mono); letter-spacing: .1em; white-space: nowrap; }
.activity-dots { display: inline-flex; align-items: center; gap: 3px; }
.activity-dots i { width: 3px; height: 3px; background: #8ed5a6; border-radius: 50%; animation: dotWave 1.2s ease-in-out infinite; }
.activity-dots i:nth-child(2) { animation-delay: .16s; }
.activity-dots i:nth-child(3) { animation-delay: .32s; }

@keyframes scanCard { 0%, 16% { left: -32%; opacity: 0; } 36%, 72% { opacity: 1; } 88%, 100% { left: 108%; opacity: 0; } }
@keyframes beacon { 0%, 100% { opacity: .45; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes packetFlow { from { left: -12px; } to { left: calc(100% + 12px); } }
@keyframes headPulse { 0% { box-shadow: 0 0 0 0 rgba(245, 255, 248, .35), 0 0 12px #d4f4df; } 100% { box-shadow: 0 0 0 9px rgba(245, 255, 248, 0), 0 0 20px #d4f4df; } }
@keyframes metaBreath { 0%, 100% { background: rgba(255, 255, 255, .055); } 50% { background: rgba(115, 193, 141, .11); } }
@keyframes dotWave { 0%, 60%, 100% { opacity: .25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }

@media (max-width: 680px) {
  .progress-card { padding: var(--space-5); }
  .run-meta { grid-template-columns: 1fr 1fr; }
  .phase-rail span { display: none; }
  .run-footer { align-items: flex-start; flex-direction: column; }
  .run-footer code { align-self: flex-end; }
}

@media (prefers-reduced-motion: reduce) {
  .scan-beam, .live-beacon i, .data-packet, .progress-head, .progress-card--live .platform-meta, .activity-dots i { animation: none; }
  .progress-fill { transition-duration: .01ms; }
}
</style>
