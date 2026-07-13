<template>
  <main class="container page-section empowerment-page">
    <PageHeader
      eyebrow="BUILD BETTER / 开发者赋能"
      title="把有限的参赛时间，用在真正重要的地方"
      description="从 AI 辅助开发到组队、路演和评审策略，建立一套能重复使用的黑客松工作流。"
    >
      <template #action><BaseButton to="/empowerment/articles" variant="secondary">浏览全部内容</BaseButton></template>
    </PageHeader>
    <DataSourceNotice :mock="usingMock" class="source-notice" />

    <section class="featured-learning">
      <div class="featured-learning__copy">
        <BaseBadge tone="brand">START HERE</BaseBadge>
        <h2>第一次参赛？先用一条完整路径建立节奏</h2>
        <p>从确定题目、搭建 MVP，到准备三分钟路演。用 45 分钟读完核心方法，再进入具体工具教程。</p>
        <BaseButton to="/empowerment/articles/hackathon-guide">开始学习 <span aria-hidden="true">→</span></BaseButton>
      </div>
      <div class="featured-learning__map" aria-hidden="true">
        <span>01<br><small>选题</small></span><i></i><span>02<br><small>构建</small></span><i></i><span>03<br><small>路演</small></span>
      </div>
    </section>

    <LearningSection eyebrow="AI-ASSISTED BUILDING" title="Vibecoding 教程" description="让 AI 成为稳定的开发搭档，而不是一次性的代码生成器。" link="/empowerment/articles?type=vibecoding" :articles="vibecodingArticles" />
    <LearningSection eyebrow="HACKATHON PLAYBOOK" title="参赛指南" description="组队、时间管理、评审表达和赛后延续，一次解决常见盲区。" link="/empowerment/articles?type=guide" :articles="guideArticles" />
  </main>
</template>

<script setup>
import { defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { empowermentAPI } from '@/api'
import PageHeader from '@/components/common/PageHeader.vue'
import DataSourceNotice from '@/components/common/DataSourceNotice.vue'
import ArticleCard from '@/components/content/ArticleCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const LearningSection = defineComponent({
  props: { eyebrow: String, title: String, description: String, link: String, articles: Array },
  setup(props) {
    return () => h('section', { class: 'learning-section' }, [
      h('div', { class: 'learning-section__heading' }, [
        h('div', [h('span', { class: 'mono' }, props.eyebrow), h('h2', props.title), h('p', props.description)]),
        h(RouterLink, { to: props.link }, { default: () => '查看全部 →' })
      ]),
      h('div', { class: 'learning-section__grid' }, (props.articles || []).map(article => h(ArticleCard, { key: article.id, article })))
    ])
  }
})

const vibecodingArticles = ref([])
const guideArticles = ref([])
const usingMock = ref(false)

onMounted(async () => {
  try {
    const [vibeRes, guideRes] = await Promise.all([empowermentAPI.getVibecoding(6), empowermentAPI.getGuides(6)])
    vibecodingArticles.value = vibeRes.data || []
    guideArticles.value = guideRes.data || []
  } catch (_) {
    usingMock.value = true
    vibecodingArticles.value = MOCK_VIBE
    guideArticles.value = MOCK_GUIDES
  }
})

const MOCK_VIBE = [
  { id: 1, title: '用 Cursor 从想法到可演示 MVP', slug: 'cursor-first-mvp', content_type: 'vibecoding', summary: '从需求拆解、生成代码到调试发布，建立可重复的 AI 开发工作流。', difficulty_level: 'beginner', estimated_read_time: 15 },
  { id: 2, title: 'Copilot 进阶：加速全栈原型开发', slug: 'copilot-fullstack', content_type: 'vibecoding', summary: '用任务拆分和上下文管理提高生成代码的准确度与可维护性。', difficulty_level: 'intermediate', estimated_read_time: 20 },
  { id: 3, title: '多模型协作的参赛工作流', slug: 'multi-model-workflow', content_type: 'vibecoding', summary: '合理分配研究、编码、评审和文档任务，在短时间保持产出质量。', difficulty_level: 'advanced', estimated_read_time: 24 }
]
const MOCK_GUIDES = [
  { id: 4, title: '黑客松组队与参赛全流程', slug: 'hackathon-guide', content_type: 'guide', summary: '从报名、组队、冲刺到赛后跟进的一站式行动指南。', difficulty_level: 'beginner', estimated_read_time: 25 },
  { id: 5, title: '高分 Pitch Deck 的信息结构', slug: 'pitch-deck', content_type: 'guide', summary: '从评审视角组织问题、洞察、方案与证据。', difficulty_level: 'intermediate', estimated_read_time: 18 },
  { id: 6, title: '三分钟 Demo 的叙事与彩排', slug: 'demo-storytelling', content_type: 'guide', summary: '让复杂技术价值在有限时间内被看懂、记住并相信。', difficulty_level: 'intermediate', estimated_read_time: 14 }
]
</script>

<style scoped>
.empowerment-page { padding-bottom: var(--space-20); }
.source-notice { margin-bottom: var(--space-6); }
.featured-learning { display: grid; grid-template-columns: 1.1fr .9fr; gap: var(--space-10); align-items: center; padding: var(--space-10); color: white; background: linear-gradient(135deg, #153927, #315f47); border-radius: var(--radius-xl); overflow: hidden; }
.featured-learning__copy h2 { max-width: 620px; margin-top: var(--space-5); font-size: clamp(1.8rem, 4vw, 3rem); letter-spacing: -.04em; }
.featured-learning__copy p { max-width: 620px; margin: var(--space-4) 0 var(--space-6); color: rgba(255,255,255,.72); }
.featured-learning__map { display: flex; align-items: center; justify-content: center; }
.featured-learning__map span { width: 86px; height: 86px; display: grid; place-content: center; color: white; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); border-radius: 50%; font: 600 var(--text-xl)/1.2 var(--font-mono); text-align: center; }
.featured-learning__map small { color: rgba(255,255,255,.65); font-size: 10px; }
.featured-learning__map i { width: 40px; height: 1px; background: rgba(255,255,255,.25); }
:deep(.learning-section) { margin-top: var(--space-16); }
:deep(.learning-section__heading) { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); }
:deep(.learning-section__heading span) { color: var(--color-primary); font-size: 10px; letter-spacing: .1em; }
:deep(.learning-section__heading h2) { margin-top: var(--space-2); font-size: var(--text-3xl); }
:deep(.learning-section__heading p) { margin-top: var(--space-2); color: var(--color-text-secondary); font-size: var(--text-sm); }
:deep(.learning-section__heading > a) { color: var(--color-primary); font-size: var(--text-sm); }
:deep(.learning-section__grid) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-5); }
@media (max-width: 900px) { .featured-learning { grid-template-columns: 1fr; } :deep(.learning-section__grid) { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .featured-learning { padding: var(--space-8) var(--space-5); } .featured-learning__map { display: none; } :deep(.learning-section__heading) { align-items: flex-start; flex-direction: column; } :deep(.learning-section__grid) { grid-template-columns: 1fr; } }
</style>
