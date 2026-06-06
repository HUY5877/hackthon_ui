<template>
  <header class="app-header">
    <div class="header-inner container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-icon mono">&#x2776;</span>
        <span class="logo-text">HACK<span class="accent">HUB</span></span>
      </router-link>

      <!-- Navigation -->
      <nav class="nav-links">
        <router-link to="/hackathons" class="nav-link">
          <span class="nav-icon">&#x2316;</span> 信息大厅
        </router-link>
        <router-link to="/inspiration" class="nav-link">
          <span class="nav-icon">&#x2606;</span> 灵感池
        </router-link>
        <router-link to="/recommendations" class="nav-link">
          <span class="nav-icon">&#x2666;</span> 推荐
        </router-link>
        <router-link to="/empowerment" class="nav-link">
          <span class="nav-icon">&#x265B;</span> 赋能区
        </router-link>
      </nav>

      <!-- Auth -->
      <div class="auth-area">
        <template v-if="auth.isLoggedIn">
          <router-link to="/profile" class="user-chip">
            <span class="user-avatar">{{ auth.user?.username?.[0]?.toUpperCase() }}</span>
            <span class="user-name">{{ auth.user?.username }}</span>
          </router-link>
          <button class="btn-logout mono" @click="auth.logout(); router.push('/')">EXIT</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-outline-glow">SIGN IN</router-link>
          <router-link to="/register" class="btn btn-primary-glow">JOIN</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  height: 72px;
  background: rgba(10, 14, 26, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-8);
}

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  font-size: var(--text-2xl);
  color: var(--color-primary);
}

.logo-text {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 900;
  color: var(--color-text-primary);
  letter-spacing: 0.05em;
}

.logo-text .accent {
  color: var(--color-primary);
}

/* ── Navigation ── */
.nav-links {
  display: flex;
  gap: var(--space-1);
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
  background: rgba(0, 212, 255, 0.08);
}

.nav-icon {
  font-size: var(--text-base);
}

/* ── Auth Area ── */
.auth-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.user-chip:hover {
  border-color: var(--color-primary);
  box-shadow: var(--glow-primary);
}

.user-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: 50%;
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: 700;
}

.user-name {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.btn-logout {
  background: none;
  border: none;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.btn-logout:hover {
  color: var(--color-error);
}

/* ── Buttons ── */
.btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
}

.btn-outline-glow {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: transparent;
}

.btn-outline-glow:hover {
  box-shadow: var(--glow-primary);
  background: rgba(0, 212, 255, 0.08);
}

.btn-primary-glow {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.btn-primary-glow:hover {
  box-shadow: var(--glow-primary);
  background: var(--color-primary-dim);
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .header-inner { justify-content: space-between; }
}
</style>