/**
 * API 客户端 — 与后端 FastAPI 网关对接
 * 后端地址: http://localhost:8000/api/v1
 *
 * 所有接口映射:
 *   B1 认证服务   → /api/v1/auth/* + /api/v1/users/*
 *   B2 内容调度   → /api/v1/hackathons/* + /api/v1/inspiration/* + /api/v1/empowerment/*
 *   B3 推荐引擎   → /api/v1/recommendations/*
 *   B4 EDM服务    → /api/v1/users/me/edm-subscribe
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// ── 请求拦截器：自动附加 JWT Token ──
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── 响应拦截器：统一错误处理 ──
api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(err)
  }
)

// ═══════════════════════════════════════════════════════════
// 认证 API
// ═══════════════════════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
}

// ═══════════════════════════════════════════════════════════
// 信息大厅 API
// ═══════════════════════════════════════════════════════════
export const hackathonsAPI = {
  list: (params) => api.get('/hackathons', { params }),
  getHot: (limit = 5) => api.get('/hackathons/hot', { params: { limit } }),
  getDetail: (slug) => api.get(`/hackathons/${slug}`),
  recordClick: (id) => api.post(`/hackathons/${id}/click`)
}

// ═══════════════════════════════════════════════════════════
// 灵感池 API
// ═══════════════════════════════════════════════════════════
export const inspirationAPI = {
  list: (params) => api.get('/inspiration', { params }),
  getDetail: (slug) => api.get(`/inspiration/${slug}`),
  interact: (data) => api.post('/inspiration/interact', data)
}

// ═══════════════════════════════════════════════════════════
// 推荐 API
// ═══════════════════════════════════════════════════════════
export const recommendationsAPI = {
  getHot: (limit = 10) => api.get('/recommendations/hot', { params: { limit } }),
  getForYou: (limit = 5) => api.get('/recommendations/for-you', { params: { limit } })
}

// ═══════════════════════════════════════════════════════════
// 开发者赋能 API
// ═══════════════════════════════════════════════════════════
export const empowermentAPI = {
  getVibecoding: (limit = 5) => api.get('/empowerment/vibecoding', { params: { limit } }),
  getGuides: (limit = 5) => api.get('/empowerment/guides', { params: { limit } }),
  listArticles: (params) => api.get('/empowerment/articles', { params }),
  getArticle: (slug) => api.get(`/empowerment/articles/${slug}`)
}

// ═══════════════════════════════════════════════════════════
// 用户 API
// ═══════════════════════════════════════════════════════════
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateTags: (data) => api.put('/users/me/tags', data),
  subscribeEDM: (subscribed) => api.put('/users/me/edm-subscribe', { subscribed }),
  getBookmarks: () => api.get('/users/me/bookmarks')
}

// ═══════════════════════════════════════════════════════════
// 系统 API
// ═══════════════════════════════════════════════════════════
export const systemAPI = {
  health: () => api.get('/health', { baseURL: '' }),
  crawlerStatus: () => api.get('/crawler/status', { baseURL: '/api' })
}

export default api
