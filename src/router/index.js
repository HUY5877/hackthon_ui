import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首页' }
  },
  // ── 信息大厅 ─────────────────────────
  {
    path: '/hackathons',
    name: 'hackathons',
    component: () => import('@/views/Hackathons/HackathonList.vue'),
    meta: { title: '信息大厅' }
  },
  {
    path: '/hackathons/:slug',
    name: 'hackathon-detail',
    component: () => import('@/views/Hackathons/HackathonDetail.vue'),
    meta: { title: '赛事详情' }
  },
  // ── 灵感池 ───────────────────────────
  {
    path: '/inspiration',
    name: 'inspiration',
    component: () => import('@/views/Inspiration/InspirationList.vue'),
    meta: { title: '灵感池' }
  },
  {
    path: '/inspiration/:slug',
    name: 'inspiration-detail',
    component: () => import('@/views/Inspiration/InspirationDetail.vue'),
    meta: { title: '案例详情', requiresAuth: true }
  },
  // ── 推荐 ─────────────────────────────
  {
    path: '/recommendations',
    name: 'recommendations',
    component: () => import('@/views/Recommendations/RecommendationsPage.vue'),
    meta: { title: '推荐' }
  },
  // ── 开发者赋能 ───────────────────────
  {
    path: '/empowerment',
    name: 'empowerment',
    component: () => import('@/views/Empowerment/EmpowermentHub.vue'),
    meta: { title: '开发者赋能' }
  },
  {
    path: '/empowerment/articles/:slug',
    name: 'article-detail',
    component: () => import('@/views/Empowerment/ArticleDetail.vue'),
    meta: { title: '文章详情' }
  },
  // ── 认证 ─────────────────────────────
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Auth/LoginPage.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Auth/RegisterPage.vue'),
    meta: { title: '注册', guest: true }
  },
  // ── 用户 ─────────────────────────────
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/User/ProfilePage.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ── 路由守卫：注册墙拦截 ──
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  if (to.meta.requiresAuth && !token) {
    // 未登录 → 弹注册墙提示，重定向到登录
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && token) {
    // 已登录 → 访问登录/注册页直接回首页
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router