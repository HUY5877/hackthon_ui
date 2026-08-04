import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { resolveAdminAccess } from '@/router/access'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomePage.vue'), meta: { title: '首页' } },
  { path: '/hackathons', name: 'hackathons', component: () => import('@/views/Hackathons/HackathonList.vue'), meta: { title: '赛事' } },
  { path: '/hackathons/:slug', name: 'hackathon-detail', component: () => import('@/views/Hackathons/HackathonDetail.vue'), meta: { title: '赛事详情' } },
  { path: '/inspiration', name: 'inspiration', component: () => import('@/views/Inspiration/InspirationList.vue'), meta: { title: '获奖灵感' } },
  { path: '/inspiration/:slug', name: 'inspiration-detail', component: () => import('@/views/Inspiration/InspirationDetail.vue'), meta: { title: '案例详情' } },
  { path: '/recommendations', name: 'recommendations', component: () => import('@/views/Recommendations/RecommendationsPage.vue'), meta: { title: '推荐' } },
  { path: '/empowerment', name: 'empowerment', component: () => import('@/views/Empowerment/EmpowermentHub.vue'), meta: { title: '参赛资源' } },
  { path: '/empowerment/articles', name: 'article-list', component: () => import('@/views/Empowerment/ArticleList.vue'), meta: { title: '文章列表' } },
  { path: '/empowerment/articles/:slug', name: 'article-detail', component: () => import('@/views/Empowerment/ArticleDetail.vue'), meta: { title: '文章详情' } },
  { path: '/login', name: 'login', component: () => import('@/views/Auth/LoginPage.vue'), meta: { title: '登录', guest: true } },
  { path: '/register', name: 'register', component: () => import('@/views/Auth/RegisterPage.vue'), meta: { title: '注册', guest: true } },
  { path: '/profile', name: 'profile', component: () => import('@/views/User/ProfilePage.vue'), meta: { title: '个人中心', requiresAuth: true } },
  {
    path: '/admin',
    component: () => import('@/views/Admin/AdminLayout.vue'),
    redirect: '/admin/hackathons',
    meta: { title: '运营控制台', requiresAdmin: true },
    children: [
      {
        path: 'hackathons',
        name: 'admin-hackathons',
        component: () => import('@/views/Admin/AdminHackathons.vue'),
        meta: { title: '赛事内容', requiresAdmin: true }
      },
      {
        path: 'crawler',
        name: 'admin-crawler',
        component: () => import('@/views/Admin/AdminCrawler.vue'),
        meta: { title: '爬虫调度', requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/Admin/AdminUsers.vue'),
        meta: { title: '用户权限', requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  const adminAccess = await resolveAdminAccess(to, useAuthStore())
  if (adminAccess !== true) return adminAccess

  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && token) return { name: 'home' }
  return true
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'HackHub'} · HackHub`
})

export default router
