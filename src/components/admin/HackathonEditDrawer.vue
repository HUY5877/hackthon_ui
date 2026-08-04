<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="open && item" class="drawer-layer" @click.self="$emit('close')">
        <aside class="edit-drawer" data-test="edit-drawer" role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <header><div><p>CONTENT DESK / EDIT</p><h2 id="edit-title">编辑赛事</h2></div><button type="button" aria-label="关闭" @click="$emit('close')">×</button></header>
          <form @submit.prevent="submit">
            <section class="lineage"><span>来源记录</span><strong>{{ item.source_platform }}</strong><code>{{ item.slug }}</code><a :href="item.source_url" target="_blank" rel="noopener noreferrer">查看原始页面 ↗</a></section>
            <p v-if="error" class="form-error" role="alert">{{ error }}</p>
            <div class="form-grid">
              <label class="wide"><span>赛事名称 *</span><input v-model="form.name" name="name" required></label>
              <label class="wide"><span>摘要</span><input v-model="form.summary" name="summary"></label>
              <label class="wide"><span>详细介绍</span><textarea v-model="form.description" name="description" rows="5"></textarea></label>
              <label><span>状态</span><select v-model="form.status" name="status"><option value="upcoming">即将开始</option><option value="registering">报名中</option><option value="ongoing">进行中</option><option value="ended">已结束</option></select></label>
              <label><span>举办方式</span><select v-model="form.mode" name="mode"><option value="online">线上</option><option value="offline">线下</option><option value="hybrid">混合</option></select></label>
              <label><span>报名开始</span><input v-model="form.registration_start" name="registration_start" type="datetime-local"></label>
              <label><span>报名截止</span><input v-model="form.registration_end" name="registration_end" type="datetime-local"></label>
              <label><span>赛事开始</span><input v-model="form.event_start" name="event_start" type="datetime-local"></label>
              <label><span>赛事结束</span><input v-model="form.event_end" name="event_end" type="datetime-local"></label>
              <label><span>国家/地区</span><input v-model="form.country" name="country"></label>
              <label><span>城市</span><input v-model="form.city" name="city"></label>
              <label class="wide"><span>详细地点</span><input v-model="form.location" name="location"></label>
              <label><span>主办方</span><input v-model="form.organizer" name="organizer"></label>
              <label><span>预计参与人数</span><input v-model.number="form.expected_participants" name="expected_participants" type="number" min="0"></label>
              <label><span>奖池说明</span><input v-model="form.prize_pool" name="prize_pool"></label>
              <label><span>奖池（美元）</span><input v-model.number="form.prize_pool_usd" name="prize_pool_usd" type="number" min="0"></label>
              <label class="wide"><span>报名链接</span><input v-model="form.registration_url" name="registration_url" type="url"></label>
              <label class="wide"><span>封面链接</span><input v-model="form.cover_image" name="cover_image" type="url"></label>
              <label><span>赛道标签（逗号分隔）</span><input v-model="form.track_tags" name="track_tags"></label>
              <label><span>技术标签（逗号分隔）</span><input v-model="form.tech_tags" name="tech_tags"></label>
              <label class="wide"><span>赞助商（逗号分隔）</span><input v-model="form.sponsors" name="sponsors"></label>
              <label class="check wide"><input v-model="form.is_verified" name="is_verified" type="checkbox"><span>标记为已人工核验</span></label>
            </div>
            <footer><span>浏览 {{ item.view_count }} · 外链点击 {{ item.external_click_count }} · 更新 {{ formatDate(item.updated_at) }}</span><div><BaseButton variant="secondary" :disabled="saving" @click="$emit('close')">取消</BaseButton><BaseButton type="button" data-test="edit-save" :loading="saving" @click="submit">保存更改</BaseButton></div></footer>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ open: Boolean, item: { type: Object, default: null }, saving: Boolean })
const emit = defineEmits(['close', 'save'])
const arrayFields = ['track_tags', 'tech_tags', 'sponsors']
const fields = ['name','summary','description','status','mode','registration_start','registration_end','event_start','event_end','track_tags','tech_tags','prize_pool','prize_pool_usd','expected_participants','location','country','city','registration_url','organizer','sponsors','cover_image','is_verified']
const form = reactive({})
const initial = ref({})
const error = ref('')

function toLocal(value) { return value ? String(value).slice(0, 16) : '' }
function normalizeValue(field, value) {
  if (arrayFields.includes(field)) return typeof value === 'string' ? value.split(',').map(item => item.trim()).filter(Boolean) : (value || [])
  if (['registration_start','registration_end','event_start','event_end'].includes(field)) return value || null
  if (['summary','description','prize_pool','location','country','city','registration_url','organizer','cover_image'].includes(field)) return value || null
  if (['prize_pool_usd','expected_participants'].includes(field)) return value === '' || value == null ? null : Number(value)
  return value
}

function reset() {
  if (!props.item) return
  fields.forEach(field => {
    const value = props.item[field]
    form[field] = arrayFields.includes(field) ? (value || []).join(', ') : (field.includes('_start') || field.includes('_end') ? toLocal(value) : value ?? '')
  })
  form.is_verified = Boolean(props.item.is_verified)
  initial.value = Object.fromEntries(fields.map(field => [field, normalizeValue(field, form[field])]))
  error.value = ''
}

function submit() {
  if (!String(form.name || '').trim()) { error.value = '赛事名称不能为空。'; return }
  if (form.registration_start && form.registration_end && form.registration_start > form.registration_end) { error.value = '报名开始时间不能晚于截止时间。'; return }
  if (form.event_start && form.event_end && form.event_start > form.event_end) { error.value = '赛事开始时间不能晚于结束时间。'; return }
  const changed = {}
  fields.forEach(field => {
    const value = normalizeValue(field, form[field])
    if (JSON.stringify(value) !== JSON.stringify(initial.value[field])) changed[field] = value
  })
  if (!Object.keys(changed).length) { error.value = '尚未修改任何内容。'; return }
  emit('save', changed)
}

function formatDate(value) { return value ? new Date(value).toLocaleString('zh-CN') : '—' }
watch(() => [props.open, props.item], reset, { immediate: true })
</script>

<style scoped>
.drawer-layer { position: fixed; inset: 0; z-index: var(--z-modal); display: flex; justify-content: flex-end; background: rgba(15,29,21,.34); backdrop-filter: blur(3px); }
.edit-drawer { width: min(92vw, 720px); height: 100%; overflow-y: auto; background: var(--surface-page); box-shadow: var(--shadow-xl); }
.edit-drawer > header { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding: var(--space-6) var(--space-8); background: rgba(247,247,243,.96); border-bottom: 1px solid var(--color-border); backdrop-filter: blur(12px); }
header p { color: var(--color-primary); font-family: var(--font-mono); font-size: 10px; letter-spacing: .12em; } header h2 { margin-top: 3px; }
header > button { width: 40px; height: 40px; background: var(--surface-card); border: 1px solid var(--color-border); border-radius: 50%; font-size: 24px; cursor: pointer; }
form { padding: var(--space-6) var(--space-8) var(--space-8); }
.lineage { display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); padding: var(--space-4); background: var(--color-primary-soft); border-radius: var(--radius-md); font-size: var(--text-xs); }
.lineage > span { color: var(--color-text-tertiary); } .lineage code { overflow: hidden; color: var(--color-text-secondary); text-overflow: ellipsis; white-space: nowrap; } .lineage a { color: var(--color-primary); font-weight: 650; }
.form-error { margin-bottom: var(--space-4); padding: var(--space-3); color: var(--color-error); background: #fbe9e7; border-radius: var(--radius-sm); font-size: var(--text-sm); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); } .wide { grid-column: 1 / -1; }
label { display: grid; gap: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); font-weight: 600; }
input, select, textarea { width: 100%; padding: 11px 12px; color: var(--color-text-primary); background: var(--surface-card); border: 1px solid var(--color-border); border-radius: var(--radius-sm); outline: 0; }
input:focus, select:focus, textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(36,84,61,.1); }
textarea { resize: vertical; } .check { display: flex; flex-direction: row; align-items: center; } .check input { width: 18px; height: 18px; }
form footer { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); margin-top: var(--space-8); padding-top: var(--space-5); border-top: 1px solid var(--color-border); }
form footer > span { color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: 10px; } form footer div { display: flex; gap: var(--space-3); }
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity var(--transition-base); } .drawer-fade-enter-active .edit-drawer, .drawer-fade-leave-active .edit-drawer { transition: transform var(--transition-base); } .drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; } .drawer-fade-enter-from .edit-drawer, .drawer-fade-leave-to .edit-drawer { transform: translateX(100%); }
@media (max-width: 620px) { .edit-drawer { width: 100%; } form, .edit-drawer > header { padding-inline: var(--space-5); } .form-grid { grid-template-columns: 1fr; } .wide { grid-column: auto; } .lineage { grid-template-columns: 1fr; } form footer { align-items: stretch; flex-direction: column; } form footer div { justify-content: flex-end; } }
</style>
