# ZEITLESS MVP PLAN

## 1. 已完成

- [x] 确定产品定位（high fashion curated store）
- [x] 确定品牌名称（Zeitless）
- [x] 确定技术栈（Better-T-Stack + Cloudflare）
- [x] 完成 MVP PRD（docs/PRD.md）
- [x] 初始化 monorepo 结构（apps + packages）

---

## 2. 未完成

### 🧱 基础设施

- [ ] 配置 Cloudflare Workers（apps/server）
- [ ] 配置 D1 数据库
- [ ] 配置 R2（图片存储）
- [x] 配置 Durable Objects（商品占位 / Cart）
- [x] 配置 Durable Objects（单品 reservation / optimistic lock）

### 🗄️ 数据层

- [x] 设计 Drizzle schema（Products / Orders / Users / Reservations）
- [x] 初始化数据库迁移

### 🔌 API 层（Hono + oRPC）

- [x] Product API（list / detail）
- [x] Reservation API（reserve / release / expire）
- [x] Cart API（add / remove / get）
- [ ] Order API（create / get / cancel / update status / refund）
- [x] Checkout reservation + order creation flow（核心购买链路）

### 🛒 Storefront（apps/web - Astro）

- [x] 首页（极简）
- [x] 商品列表页
- [x] 商品详情页
- [x] 全局购物车抽屉（drawer）
- [x] Checkout 页面
- [x] 30 分钟内取消 / 退款提示

### 🧠 Dashboard（apps/dashboard - TanStack Start）

- [ ] 商品管理（CRUD）
- [ ] 图片上传（R2）
- [ ] 订单管理
- [ ] 发货 & 填写 tracking number
- [ ] 查看 reservation / refund 状态

### 💳 支付

- [x] Stripe Checkout Sessions
- [x] Webhook 处理订单状态
- [x] 支付后 30 分钟内可取消退款

### 🚚 物流

- [ ] AfterShip 集成
- [ ] tracking 查询接口

### 🔐 认证

- [ ] better-auth 集成
- [ ] admin 登录
- [ ] admin email 环境变量校验（Data Hooks）

---

## 3. 下一步（优先级）

### ⭐ Priority 1

- [x] Buyer order access by email token
- [x] 商品列表页（Astro）

### ⭐ Priority 2

- [x] 商品详情页
- [ ] 登录买家能力（Better Auth 完整落地之后）
- [ ] 订单取消 / 退款规则

### ⭐ Priority 3

- [x] Stripe Checkout Session + webhook
- [x] Order 系统（含 paid / refund 状态推进）

### ⭐ Priority 4

- [ ] Dashboard（基础 CRUD）

### ⭐ Priority 5

- [ ] AfterShip（物流追踪）

---

## 4. 备注

- MVP 不做复杂库存（1 product = 1 item）
- 优先保证：商品展示 + 购买 / 退款闭环 + 防超卖
- 所有服务优先部署在 Cloudflare
- Contract-first 设计按业务域组织，业务路由优先于 App/Admin 包装层。
- 登录买家能力放在 Better Auth 完整落地之后再做，第一期不按登录态拆核心业务 schema。
- 修改 `packages/db/src/schema/*` 后，先运行 `bun run db:generate` 生成 migration，再运行 `bun run deploy` 通过 Alchemy 同步数据库。
- `packages/api` currently wires the db-backed public product list/detail, reservation create/release/expire, buyer order create/get/cancel handlers, and DO-backed cart/checkout handlers; guest-vs-login cart persistence stays a later Better Auth enhancement.
- Stripe payment will use hosted Checkout Sessions first; frontend customization can come later when the storefront is ready.
- Buyer cancellation now issues a real Stripe refund inside the 30-minute window and releases the reservation back to inventory.
- Storefront implementation now includes the product detail page with Astro-first route composition, shared layout components, mock data in `apps/web/src/lib/data.ts`, a desktop masonry collage, and a mobile shadcn carousel.
