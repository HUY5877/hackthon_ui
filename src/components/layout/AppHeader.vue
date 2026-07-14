<template>
  <header class="app-header">
    <div class="header-inner container">
      <RouterLink to="/" class="logo" aria-label="HackHub 首页" @click="closeMenu">
        <span class="logo-mark" aria-hidden="true">H</span>
        <span class="logo-text">HACKHUB</span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <button class="search-action" type="button" @click="router.push('/hackathons')">
          <span class="search-symbol" aria-hidden="true"></span>
          <span>搜索</span>
        </button>

        <template v-if="auth.isLoggedIn">
          <RouterLink to="/profile" class="user-chip">
            <span class="user-avatar">{{ userInitial }}</span>
            <span class="user-name">{{ auth.user?.username }}</span>
          </RouterLink>
        </template>
        <template v-else>
          <BaseButton to="/login" variant="ghost" size="sm" class="desktop-auth">登录</BaseButton>
          <BaseButton to="/register" size="sm" class="desktop-auth">注册</BaseButton>
        </template>

        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          aria-label="打开导航菜单"
          @click="menuOpen = !menuOpen"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="menu-fade">
        <div v-if="menuOpen" class="mobile-layer" @click.self="closeMenu">
          <nav id="mobile-navigation" class="mobile-nav" aria-label="移动端主导航">
            <div class="mobile-nav__header">
              <span class="mobile-nav__eyebrow">浏览 HackHub</span>
              <button type="button" class="mobile-nav__close" aria-label="关闭导航菜单" @click="closeMenu">×</button>
            </div>
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="mobile-nav__link"
              @click="closeMenu"
            >
              <span>{{ item.label }}</span><span aria-hidden="true">→</span>
            </RouterLink>
            <div class="mobile-nav__footer">
              <template v-if="auth.isLoggedIn">
                <BaseButton to="/profile" block @click="closeMenu">个人中心</BaseButton>
                <BaseButton variant="secondary" block @click="logout">退出登录</BaseButton>
              </template>
              <template v-else>
                <BaseButton to="/login" variant="secondary" block @click="closeMenu">登录</BaseButton>
                <BaseButton to="/register" block @click="closeMenu">创建账号</BaseButton>
              </template>
            </div>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const menuOpen = ref(false)

const navItems = [
  { to: '/hackathons', label: '赛事' },
  { to: '/inspiration', label: '获奖灵感' },
  { to: '/recommendations', label: '推荐' },
  { to: '/empowerment', label: '参赛资源' }
]

const userInitial = computed(() => auth.user?.username?.[0]?.toUpperCase() || 'U')

function closeMenu() {
  menuOpen.value = false
}

function logout() {
  auth.logout()
  closeMenu()
  router.push('/')
}

watch(() => route.fullPath, closeMenu)
watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.app-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: var(--z-sticky);
  height: var(--header-height);
  background: rgba(247, 247, 243, 0.92);
  border-bottom: 1px solid rgba(221, 226, 222, 0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.header-inner {
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-8);
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-primary);
  text-decoration: none;
}

.logo:hover { text-decoration: none; }

.logo-mark {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: 9px;
  font-family: var(--font-display);
  font-weight: 750;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.035em;
}

.desktop-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-8);
}

.nav-link {
  position: relative;
  padding-block: 24px;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 550;
}

.nav-link::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 15px;
  left: 0;
  height: 2px;
  background: var(--color-primary);
  transform: scaleX(0);
  transition: transform var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active { color: var(--color-text-primary); text-decoration: none; }
.nav-link:hover::after,
.nav-link.router-link-active::after { transform: scaleX(1); }

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
}

.search-action {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding-inline: var(--space-3);
  color: var(--color-text-secondary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  font-size: var(--text-sm);
  cursor: pointer;
}

.search-action:hover { color: var(--color-text-primary); background: var(--surface-muted); }

.search-symbol {
  width: 15px;
  height: 15px;
  display: block;
  position: relative;
  border: 1.8px solid currentColor;
  border-radius: 50%;
}

.search-symbol::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 1.8px;
  right: -5px;
  bottom: -2px;
  background: currentColor;
  transform: rotate(45deg);
  border-radius: 2px;
}

.user-chip {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 10px 4px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: 50%;
  font-size: var(--text-xs);
  font-weight: 700;
}

.user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; font-size: var(--text-sm); white-space: nowrap; }

.menu-toggle {
  width: 44px;
  height: 44px;
  display: none;
  place-items: center;
  align-content: center;
  gap: 4px;
  padding: 0;
  background: var(--surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  cursor: pointer;
}

.menu-toggle span { width: 18px; height: 1.5px; display: block; background: var(--color-text-primary); border-radius: 2px; }

.mobile-layer {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  justify-content: flex-end;
  background: rgba(23, 34, 28, 0.28);
}

.mobile-nav {
  width: min(88vw, 380px);
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  background: var(--surface-card);
  box-shadow: var(--shadow-xl);
}

.mobile-nav__header { display: flex; align-items: center; justify-content: space-between; padding-bottom: var(--space-6); }
.mobile-nav__eyebrow { color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.08em; }
.mobile-nav__close { width: 44px; height: 44px; color: var(--color-text-primary); background: var(--surface-muted); border: 0; border-radius: 50%; font-size: 25px; cursor: pointer; }
.mobile-nav__link { display: flex; justify-content: space-between; align-items: center; min-height: 58px; border-bottom: 1px solid var(--color-border-subtle); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; }
.mobile-nav__link:hover { color: var(--color-primary); text-decoration: none; }
.mobile-nav__footer { display: grid; gap: var(--space-3); margin-top: auto; padding-top: var(--space-8); }

.menu-fade-enter-active,
.menu-fade-leave-active { transition: opacity var(--transition-base); }
.menu-fade-enter-active .mobile-nav,
.menu-fade-leave-active .mobile-nav { transition: transform var(--transition-base); }
.menu-fade-enter-from,
.menu-fade-leave-to { opacity: 0; }
.menu-fade-enter-from .mobile-nav,
.menu-fade-leave-to .mobile-nav { transform: translateX(100%); }

@media (max-width: 900px) {
  .header-inner { grid-template-columns: auto 1fr; }
  .desktop-nav,
  .desktop-auth,
  .search-action span:last-child { display: none; }
  .header-actions { justify-self: end; }
  .menu-toggle { display: grid; }
}

@media (max-width: 560px) {
  .user-chip { display: none; }
  .search-action { width: 44px; justify-content: center; }
}
</style>
