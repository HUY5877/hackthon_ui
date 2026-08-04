<template>
  <div class="admin-shell">
    <aside class="admin-rail">
      <div class="rail-heading">
        <span class="rail-signal" aria-hidden="true"><i></i><i></i><i></i></span>
        <div><strong>运营控制台</strong><small>ADMIN / OPS</small></div>
      </div>
      <nav aria-label="管理员导航">
        <RouterLink to="/admin/users"><span>01</span><span><strong>用户权限</strong><small>Access control</small></span></RouterLink>
        <RouterLink to="/admin/hackathons"><span>02</span><span><strong>赛事内容</strong><small>Content desk</small></span></RouterLink>
        <span class="rail-placeholder"><span>03</span><span><strong>爬虫调度</strong><small>Crawler runs</small></span></span>
      </nav>
      <div class="rail-foot"><span></span>权限边界已启用</div>
    </aside>
    <nav class="admin-tabs" aria-label="移动端管理员导航">
      <RouterLink to="/admin/users">用户权限</RouterLink><RouterLink to="/admin/hackathons">赛事内容</RouterLink><span>爬虫调度</span>
    </nav>
    <main class="admin-workspace"><RouterView /></main>
  </div>
</template>

<style scoped>
.admin-shell { min-height: calc(100vh - var(--header-height)); display: grid; grid-template-columns: 244px minmax(0, 1fr); background: var(--surface-page); }
.admin-rail { position: sticky; top: var(--header-height); height: calc(100vh - var(--header-height)); display: flex; flex-direction: column; padding: var(--space-8) var(--space-5); color: #eaf0ec; background: #173326; border-right: 1px solid rgba(255,255,255,.08); }
.rail-heading { display: flex; align-items: center; gap: var(--space-3); padding: 0 var(--space-2) var(--space-8); }
.rail-heading strong, .rail-heading small, .admin-rail nav strong, .admin-rail nav small { display: block; }
.rail-heading strong { font-size: var(--text-sm); }
.rail-heading small { color: #91a89b; font-family: var(--font-mono); font-size: 10px; letter-spacing: .12em; }
.rail-signal { display: flex; align-items: flex-end; gap: 3px; width: 34px; height: 34px; padding: 9px; background: #24543d; border-radius: 10px; }
.rail-signal i { width: 3px; background: #d6e8dc; border-radius: 2px; }
.rail-signal i:nth-child(1) { height: 7px; } .rail-signal i:nth-child(2) { height: 13px; } .rail-signal i:nth-child(3) { height: 10px; }
.admin-rail nav { display: grid; gap: var(--space-2); }
.admin-rail nav > * { min-height: 62px; display: grid; grid-template-columns: 28px 1fr; align-items: center; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-md); }
.admin-rail nav > * > span:first-child { color: #789081; font-family: var(--font-mono); font-size: 10px; }
.admin-rail nav strong { font-size: var(--text-sm); } .admin-rail nav small { color: #8da094; font-size: 10px; }
.admin-rail a:hover, .admin-rail a.router-link-active { color: #fff; background: rgba(255,255,255,.09); text-decoration: none; }
.admin-rail a.router-link-active > span:first-child { color: #b7d9c3; }
.rail-placeholder { color: #91a097; opacity: .62; cursor: not-allowed; }
.rail-foot { display: flex; align-items: center; gap: var(--space-2); margin-top: auto; padding: var(--space-3); color: #8da094; font-family: var(--font-mono); font-size: 10px; }
.rail-foot span { width: 7px; height: 7px; background: #62b47f; border-radius: 50%; box-shadow: 0 0 0 4px rgba(98,180,127,.12); }
.admin-tabs { display: none; } .admin-workspace { min-width: 0; }
@media (max-width: 880px) {
  .admin-shell { display: block; } .admin-rail { display: none; }
  .admin-tabs { position: sticky; top: var(--header-height); z-index: 8; display: flex; gap: var(--space-2); overflow-x: auto; padding: var(--space-3) var(--layout-gutter); background: rgba(247,247,243,.95); border-bottom: 1px solid var(--color-border); backdrop-filter: blur(12px); }
  .admin-tabs > * { flex: 0 0 auto; padding: 8px 12px; color: var(--color-text-tertiary); border-radius: var(--radius-full); font-size: var(--text-sm); }
  .admin-tabs a.router-link-active { color: var(--color-text-inverse); background: var(--color-primary); }
}
</style>
