# Weekend Family Planner — 项目上下文

## 产品简介
帮助 30-45 岁有孩子的忙碌家长规划周末亲子活动。
用户在 Settings 填写家庭偏好（城市、孩子年龄、预算、交通）
→ 输入本周想法（可跳过）→ 获得 3 个可执行的周末计划
→ 保存 → 收提醒 → 执行

## 核心价值
不是活动目录，而是"可执行的家庭周末安排"。
每个计划包含：时间线（从家出发）、准备清单、备用方案、来源。

## 技术栈
前端：Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
后端：FastAPI + Python 3.11 + SQLAlchemy 2.0 + Alembic
数据库：PostgreSQL（Supabase 托管）
认证：自定义 JWT（HS256，30天有效）+ Email Magic Link（Resend 发送）
邮件：Resend
爬虫：Playwright + BeautifulSoup4（Factory 模式）
调度：APScheduler（内嵌 FastAPI）
前端部署：Vercel
后端部署：Railway
代码仓库：github.com/bjstevenyang/weekend-planner

## 项目结构
weekend-planner/          ← Monorepo 根目录
  frontend/               ← Next.js，部署到 Vercel
    app/                  ← 页面（App Router）
    components/
      ui/                 ← shadcn 基础组件
      features/           ← 业务组件
    lib/
      api.ts              ← 所有 API 调用的唯一出口
      hooks/              ← 自定义 hooks
    types/                ← TypeScript 类型定义
  backend/                ← FastAPI，部署到 Railway
    main.py               ← 应用入口
    database.py           ← SQLAlchemy 配置
    models.py             ← 数据库表定义
    schemas.py            ← Pydantic schemas
    routers/              ← HTTP 路由层
    services/             ← 业务逻辑层
    repositories/         ← 数据库查询层
    crawler/              ← 爬虫框架
      base_spider.py
      factory.py
      spiders/
      utils/

## 分层规则（严格遵守）
router → service → repository → database
每层只调用下一层，不跨层调用
router 只处理 HTTP，不写业务逻辑
service 只写业务逻辑，不直接查数据库
repository 只写数据库操作

## 前端规范
- 所有 API 调用必须通过 lib/api.ts，不在组件里直接 fetch
- Props 必须有 TypeScript interface，不用 any
- 异步操作必须有 loading 状态（Skeleton 或 spinner）
- 错误必须有用户友好提示（sonner toast）
- 表单提交后禁用按钮防止重复提交
- 移动端优先，先在 375px 验证再做桌面

## 后端规范
- 所有接口用 Pydantic schema 定义输入输出
- 所有接口加 response_model 参数
- 错误用 HTTPException，附带清晰 detail
- 数据库操作用 dependency injection 传入 session

## 设计规范
主色：teal-600 (#0D9488)
页面背景：gray-50
卡片：bg-white + rounded-2xl + shadow-sm + p-4
主按钮：teal-600 + rounded-xl
标签/Badge：rounded-full
底部操作栏：sticky bottom-0 + 顶部阴影

## 已完成页面（frontend/app/）
用户侧：
  /                        落地页（CTA、示例计划卡片、功能介绍）
  /login                   Magic Link 登录
  /auth/check-email        查收邮件提示页
  /auth/verify             Token 验证 + profile 双向同步
  /auth/expired            链接过期处理
  /settings                家庭 Profile 配置（含内联城市选择）
  /idea                    周末想法输入 + 时间段选择
  /generating              生成过渡页（调 API + 动画）
  /results                 结果页（3 张计划卡片）
  /plans/[id]              计划详情页
  /plans/[id]/save         保存确认页（选日期/时间/提醒）
  /saved-plans             已保存计划列表
  /saved-plans/[id]        已保存计划详情（checklist / 状态管理）

Admin 后台（/admin/*）：
  /admin                   后台首页（统计概览）
  /admin/login             后台登录
  /admin/cities            城市管理
  /admin/events            活动管理（CRUD）
  /admin/places            地点管理（CRUD）
  /admin/plans             生成计划查看
  /admin/sources           内容来源管理 + 手动触发爬虫
  /admin/feedback          用户反馈查看

## 已完成后端 API（backend/routers/）

### /api/auth
  POST   /api/auth/send-link       发送 Magic Link 邮件
  GET    /api/auth/verify          验证 token，返回 session_token（JWT）
  GET    /api/auth/me              获取当前登录用户信息

### /api/cities
  GET    /api/cities               获取城市列表
  GET    /api/cities/{city_id}     获取单个城市
  POST   /api/cities/waitlist      加入候补名单

### /api/families
  GET    /api/families/me          获取当前用户的 family profile
  POST   /api/families             创建 family profile
  PUT    /api/families/{family_id} 更新 family profile

### /api/plans
  POST   /api/plans/generate                         生成计划（匿名或已登录）
  POST   /api/plans/claim                            认领匿名生成的计划
  GET    /api/plans/{plan_id}                        获取单个生成计划详情
  POST   /api/plans/save                             保存计划
  GET    /api/plans/saved/me                         获取当前用户已保存计划列表
  GET    /api/plans/saved/{saved_plan_id}            获取已保存计划详情
  PATCH  /api/plans/saved/{saved_plan_id}/status     更新计划状态（completed/cancelled）
  PATCH  /api/plans/saved/{saved_plan_id}/checklist/{item_id}  更新 checklist 项
  POST   /api/plans/feedback                         提交计划反馈

### /api/admin（需要 admin 权限）
  GET    /api/admin/stats
  GET/PUT  /api/admin/cities/{city_id}
  GET/POST/PUT/DELETE  /api/admin/events/{event_id}
  GET/POST/PUT  /api/admin/places/{place_id}
  GET    /api/admin/feedback
  GET    /api/admin/plans
  GET    /api/admin/sources
  POST   /api/admin/crawl/{source_id}

## 已创建数据库表（backend/models.py）
认证：
  users, login_tokens

城市：
  cities, city_neighbors, waitlist_requests

家庭 Profile：
  families, children_profiles, family_preferences

内容数据：
  content_sources, events, places

计划：
  plan_requests, generated_plans, recommendation_exposures
  saved_plans, checklist_items, reminders

运营：
  plan_feedback, crawl_jobs, analytics_events

## 重要业务逻辑

### 认证流程
自定义 JWT，不使用 Supabase Auth：
1. POST /send-link → 生成 32 字节随机 token，SHA-256 hash 后存 DB，plain token 通过 Resend 发邮件
2. GET /verify?token=xxx → 对比 hash，检查 used_at（单次使用）和 expires_at（10分钟），验证通过后返回 JWT session_token（30天有效）
3. 后续请求带 Bearer token，后端通过 JWT 验证身份

### Profile 同步策略
- 未登录：profile 存 localStorage（family_profile、city_id、city_name 等 key）
- 登录时（auth/verify）：
  - 有本地 profile（含 city_id）→ push 到 DB（create 或 update family）
  - 无本地 profile → 从 DB pull（GET /api/families/me），映射字段写入 localStorage
  - 两者都失败 → 强制跳转 /settings
- Settings 保存时：必须已登录，同步写 localStorage + DB

### 计划生成流程
LLM 解析 user_idea → 结构化 constraints
规则系统过滤和打分（不用 LLM）→ top 3 候选活动
LLM 组装 timeline + checklist + reason
LLM 不发明活动，只基于数据库真实数据

### 爬虫设计
Factory 模式：每个数据源一个 Spider 类
每周一三五凌晨 2 点自动运行
Admin 后台可手动触发单个数据源
抓完后 LLM 自动分类打标
source_id + source_external_id 联合唯一去重

### 推荐排序权重
年龄匹配：最高权重
数据新鲜度（last_verified_at）：高权重
用户兴趣标签匹配：中权重
天气感知（下雨优先室内）：动态权重
未看过的活动（recommendation_exposures）：加分

## 环境变量（backend/.env）
DATABASE_URL
ANTHROPIC_API_KEY
RESEND_API_KEY
JWT_SECRET

## 环境变量（frontend/.env.local）
NEXT_PUBLIC_API_URL

## 不要做的事
- 不用 any 类型
- 不在 router 层写业务逻辑
- 不在组件里直接写 fetch
- 不 hardcode 城市名或任何配置值
- 不让 LLM 发明数据库里没有的活动
- 不跳过错误处理
- 不在没有 loading 状态的情况下发 API 请求
