import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, usersAPI } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('access_token') || '')
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isGuest = computed(() => !token.value)

  async function login(email, password) {
    loading.value = true
    try {
      const res = await authAPI.login({ email, password })
      const { access_token, user: userData } = res.data
      token.value = access_token
      user.value = userData
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || '登录失败' }
    } finally {
      loading.value = false
    }
  }

  async function register(email, username, password) {
    loading.value = true
    try {
      const res = await authAPI.register({ email, username, password })
      const { access_token, user: userData } = res.data
      token.value = access_token
      user.value = userData
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || '注册失败' }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  async function updateProfileTags(tags) {
    try {
      const res = await usersAPI.updateTags(tags)
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
      return { success: true }
    } catch (err) {
      return { success: false, error: '更新失败' }
    }
  }

  async function subscribeEDM(subscribed) {
    try {
      await usersAPI.subscribeEDM(subscribed)
      if (user.value) {
        user.value.edm_subscribed = subscribed
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: '订阅设置失败' }
    }
  }

  return { user, token, loading, isLoggedIn, isGuest, login, register, logout, updateProfileTags, subscribeEDM }
})