# 黑客松信息聚合与开发者赋能平台 — 前端

## 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | Vue 3.5 (Composition API) |
| **构建工具** | Vite 5.4 |
| **路由** | Vue Router 4.4 |
| **状态管理** | Pinia 2.2 |
| **HTTP 客户端** | Axios 1.7 |
| **工具库** | @vueuse/core 11.0 |
| **设计风格** | Cyberpunk Developer Theme (暗色 + 霓虹发光) |
| **字体** | Orbitron (标题) + JetBrains Mono (代码) |

## 项目结构

```
src/
├── main.js                     # Vue 应用入口
├── App.vue                     # 根组件（Header + Router View + Footer）
├── router/
│   └── index.js                # 路由配置 + 注册墙守卫
├── stores/
│   └── auth.js                 # 认证状态管理（Pinia）
├── api/
│   └── index.js                # 后端 API 客户端（Axios 封装）
├── assets/
│   └── styles/
│       ├── variables.css       # 设计 Token（颜色/字体/间距/发光效果）
│       └── global.css          # 全局样式 Reset + 动画
├── components/
│   ├── layout/
│   │   └── AppHeader.vue       # 顶部导航栏
│   ├── common/
│   │   └── HackathonCard.vue   # 赛事卡片组件
│   └── ui/
│       └── GlowCard.vue        # 霓虹发光卡片容器
└── views/
    ├── HomePage.vue            # 首页（Hero + 热门赛事 + Bento 功能展示）
    ├── Hackathons/
    │   ├── HackathonList.vue   # 信息大厅（多维筛选列表）
    │   └── HackathonDetail.vue # 赛事详情 + 外链跳转
    ├── Inspiration/
    │   ├── InspirationList.vue # 灵感池列表
    │   └── InspirationDetail.vue # 案例详情（注册墙拦截）
    ├── Recommendations/
    │   └── RecommendationsPage.vue # 热度榜 + 个性化推荐
    ├── Empowerment/
    │   ├── EmpowermentHub.vue  # Vibecoding 教程 + 参赛指南
    │   └── ArticleDetail.vue   # 文章详情
    ├── Auth/
    │   ├── LoginPage.vue       # 登录页
    │   └── RegisterPage.vue    # 注册页
    └── User/
        └── ProfilePage.vue     # 个人中心（画像标签 / EDM 订阅）
```

## 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问页面
open http://localhost:3000
```

开发服务器默认端口 3000，后端 API 自动代理到 `http://localhost:8000`。

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | Hero + 热门赛事 + Bento 功能入口 |
| `/hackathons` | 信息大厅 | 赛事列表（搜索/状态/形式/排序） |
| `/hackathons/:slug` | 赛事详情 | 详情 + 技术栈 + 赞助商 + 官网跳转 |
| `/inspiration` | 灵感池 | 案例列表（分类/难度筛选） |
| `/inspiration/:slug` | 案例详情 | 注册墙拦截（未登录仅看摘要） |
| `/recommendations` | 推荐 | 综合热度榜 + 猜你适合 |
| `/empowerment` | 赋能区 | Vibecoding 教程 + 参赛指南 |
| `/empowerment/articles/:slug` | 文章详情 | 教程/指南完整内容 |
| `/login` | 登录 | 邮箱密码登录 |
| `/register` | 注册 | 邮箱 + 用户名 + 密码注册 |
| `/profile` | 个人中心 | 画像标签编辑 + EDM 订阅 |

## 前端 ↔ 后端 API 对应关系

代码严格按照后端 `app/api/v1/` 的接口结构实现：

```
auth.js (后端 B1)
  → POST /api/v1/auth/register    注册
  → POST /api/v1/auth/login       登录

hackathons.js (后端 B2 — 信息大厅)
  → GET  /api/v1/hackathons       赛事列表（多维筛选）
  → GET  /api/v1/hackathons/hot   热度榜
  → GET  /api/v1/hackathons/:slug 赛事详情
  → POST /api/v1/hackathons/:id/click  外链点击记录

inspiration.js (后端 B2 — 灵感池)
  → GET  /api/v1/inspiration          案例列表
  → GET  /api/v1/inspiration/:slug    案例详情（注册墙）
  → POST /api/v1/inspiration/interact 点赞/收藏

recommendations.js (后端 B3)
  → GET /api/v1/recommendations/hot     综合热度榜
  → GET /api/v1/recommendations/for-you 个性化推荐

empowerment.js (后端 B2 — 赋能区)
  → GET /api/v1/empowerment/vibecoding  Vibecoding 教程
  → GET /api/v1/empowerment/guides      参赛指南
  → GET /api/v1/empowerment/articles    文章列表
  → GET /api/v1/empowerment/articles/:slug 文章详情

users.js (后端 B1 + B4)
  → GET /api/v1/users/me               用户画像
  → PUT /api/v1/users/me/tags          更新画像标签
  → PUT /api/v1/users/me/edm-subscribe EDM 订阅
```

## 设计系统

基于 ui-ux-pro-max 生成的 Cyberpunk Developer Theme：

| 元素 | 值 |
|------|-----|
| **主题** | 暗色（深空黑 #0A0E1A） |
| **主色调** | 霓虹青 #00D4FF |
| **强调色** | 警示橙 #F97316 |
| **卡片** | 玻璃拟态 + 渐变边框发光 |
| **字体** | Orbitron (标题) + JetBrains Mono (代码) |
| **效果** | 霓虹发光、hover 抬升、页面淡入过渡 |

## 当前状态

⚠️ **框架阶段** — 所有页面已实现，API 调用对接后端 Mock 数据。后端不可用时自动降级为内置 Mock 数据，确保前端可独立运行和调试。

后续开发：
- [ ] 完善交互细节（Toast 通知、骨架屏动画）
- [ ] 移动端响应式适配优化
- [ ] 接入真实后端数据后的联调测试
- [ ] E2E 测试