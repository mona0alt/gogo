# 「我的」页面附属功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现「我的」页面中的优惠券、收货地址、帮助与反馈、关于我们四个功能，包括数据库集合、云函数、前端页面及类型定义。

**Architecture:** 基于现有微信云开发架构（云函数 + 云数据库），前端使用 Vue 3 + uni-app + TypeScript。优惠券和地址需要后端存储与接口；帮助与反馈、关于我们纯静态展示。

**Tech Stack:** Vue 3, uni-app, TypeScript, Pinia, SCSS, 微信云开发 (wx-server-sdk), MongoDB

---

## 文件结构

### 新增文件

| 文件 | 职责 |
|------|------|
| `cloudfunctions/getCoupons/index.js` | 查询用户优惠券列表 |
| `cloudfunctions/getCoupons/package.json` | 云函数依赖声明 |
| `cloudfunctions/receiveCoupon/index.js` | 领取优惠券 |
| `cloudfunctions/receiveCoupon/package.json` | 云函数依赖声明 |
| `cloudfunctions/validateCoupon/index.js` | 校验优惠券可用性 |
| `cloudfunctions/validateCoupon/package.json` | 云函数依赖声明 |
| `cloudfunctions/getAddresses/index.js` | 查询收货地址列表 |
| `cloudfunctions/getAddresses/package.json` | 云函数依赖声明 |
| `cloudfunctions/saveAddress/index.js` | 新增/更新收货地址 |
| `cloudfunctions/saveAddress/package.json` | 云函数依赖声明 |
| `cloudfunctions/deleteAddress/index.js` | 删除收货地址 |
| `cloudfunctions/deleteAddress/package.json` | 云函数依赖声明 |
| `src/pages/coupons/index.vue` | 优惠券列表页 |
| `src/pages/address/index.vue` | 收货地址列表页 |
| `src/pages/address-edit/index.vue` | 新建/编辑收货地址页 |
| `src/pages/help/index.vue` | 帮助与反馈页 |
| `src/pages/about/index.vue` | 关于我们页 |

### 修改文件

| 文件 | 职责 |
|------|------|
| `database/init.json` | 新增 `coupons`, `user_coupons`, `delivery_address` 集合及索引 |
| `src/types/domain.ts` | 新增 `Coupon`, `UserCoupon`, `DeliveryAddress` 接口 |
| `src/types/api.ts` | 新增云函数返回类型 |
| `src/api/index.ts` | 新增 `couponApi` 和 `addressApi` |
| `src/constants/routes.ts` | 新增新页面路由常量 |
| `src/pages.json` | 注册 5 个新页面到路由表 |
| `src/pages/mine/index.vue` | 修正 `goToCoupons` 等跳转，使用 `ROUTES` 常量 |
| `cloudfunctions/createOrder/index.js` | 扩展支持 `userCouponId` 参数，下单时核销优惠券 |

---

## Task 1: 数据库集合与索引

**Files:**
- Modify: `database/init.json`

**Context:** 云数据库需要预先定义集合和索引。`initDatabase` 云函数会读取此文件初始化数据库。

- [ ] **Step 1: 在 `collections` 数组末尾追加三个新集合配置**

```json
    {
      "name": "coupons",
      "indexes": [
        { "name": "status", "fields": ["status"] }
      ]
    },
    {
      "name": "user_coupons",
      "indexes": [
        { "name": "openid_status", "fields": ["openid", "status"] },
        { "name": "openid_expireAt", "fields": ["openid", "expireAt"] },
        { "name": "couponId", "fields": ["couponId"] }
      ]
    },
    {
      "name": "delivery_address",
      "indexes": [
        { "name": "openid", "fields": ["openid"] },
        { "name": "openid_isDefault", "fields": ["openid", "isDefault"] }
      ]
    }
```

- [ ] **Step 2: Commit**

```bash
git add database/init.json
git commit -m "chore: add coupons, user_coupons, delivery_address collections

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: 领域类型定义

**Files:**
- Modify: `src/types/domain.ts`

**Context:** 所有业务实体接口统一定义在此文件，API 层和组件直接引用。

- [ ] **Step 1: 在文件末尾追加以下类型定义**

```typescript
export type CouponType = 'fixed' | 'threshold' | 'discount'
export type CouponScopeType = 'all' | 'bar' | 'category'
export type UserCouponStatus = 'unused' | 'used' | 'expired'

export interface Coupon {
  id: string
  name: string
  type: CouponType
  value: number
  threshold: number
  scopeType: CouponScopeType
  scopeTarget?: string
  validDays: number
  status: 'active' | 'inactive'
}

export interface UserCoupon {
  id: string
  couponId: string
  name: string
  type: CouponType
  value: number
  threshold: number
  scopeType: CouponScopeType
  scopeTarget?: string
  status: UserCouponStatus
  expireAt: string
  usedAt?: string
  orderId?: string
}

export interface DeliveryAddress {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/domain.ts
git commit -m "types: add Coupon, UserCoupon, DeliveryAddress domain types

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: API 返回类型

**Files:**
- Modify: `src/types/api.ts`

**Context:** 定义云函数返回的扁平类型结构。

- [ ] **Step 1: 在文件导入处新增 `UserCoupon` 和 `DeliveryAddress`**

将现有导入行：
```typescript
import type {
  User,
  Bar,
  Product,
  CartItem,
  Order,
  GroupWithCreator,
  MatchRequest,
  CreatorInfo,
  Group,
} from './domain'
```

修改为：
```typescript
import type {
  User,
  Bar,
  Product,
  CartItem,
  Order,
  GroupWithCreator,
  MatchRequest,
  CreatorInfo,
  Group,
  UserCoupon,
  DeliveryAddress,
} from './domain'
```

- [ ] **Step 2: 在文件末尾追加返回类型**

```typescript
export type CouponListResult = { success: boolean; list: UserCoupon[]; total: number }
export type ReceiveCouponResult = { success: boolean; userCouponId: string }
export type ValidateCouponResult = { success: boolean; valid: boolean }
export type AddressListResult = { success: boolean; list: DeliveryAddress[]; total: number }
export type SaveAddressResult = { success: boolean; addressId: string }
```

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts
git commit -m "types: add coupon and address cloud function result types

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: API 层封装

**Files:**
- Modify: `src/api/index.ts`

**Context:** 所有云函数调用统一收口到 `src/api/index.ts`，按领域分组。

- [ ] **Step 1: 在导入类型处新增 `CouponListResult`, `ReceiveCouponResult`, `ValidateCouponResult`, `AddressListResult`, `SaveAddressResult`, `UserCouponStatus`**

将现有导入行：
```typescript
import type {
  LoginResult,
  BarListResult,
  CartListResult,
  OrderListResult,
  GroupListResult,
  MatchInviteResult,
} from '@/types/api'
```

修改为：
```typescript
import type {
  LoginResult,
  BarListResult,
  CartListResult,
  OrderListResult,
  GroupListResult,
  MatchInviteResult,
  CouponListResult,
  ReceiveCouponResult,
  ValidateCouponResult,
  AddressListResult,
  SaveAddressResult,
} from '@/types/api'
```

将现有导入行：
```typescript
import type {
  User,
  Bar,
  Product,
  Order,
  GroupWithCreator,
} from '@/types/domain'
```

修改为：
```typescript
import type {
  User,
  Bar,
  Product,
  Order,
  GroupWithCreator,
  UserCouponStatus,
} from '@/types/domain'
```

- [ ] **Step 2: 在 `followApi` 定义之后、`// Re-export individual APIs` 注释之前，插入两个新 API 对象**

```typescript
// Coupon API
export const couponApi = {
  getList: (params?: { status?: UserCouponStatus; page?: number; pageSize?: number }) =>
    callFn<CouponListResult>('getCoupons', params as Record<string, unknown>),

  receive: (couponId: string) =>
    callFn<ReceiveCouponResult>('receiveCoupon', { couponId }),

  validate: (data: { userCouponId: string; orderAmount: number; barId?: string }) =>
    callFn<ValidateCouponResult>('validateCoupon', data),
}

// Address API
export const addressApi = {
  getList: (params?: { page?: number; pageSize?: number }) =>
    callFn<AddressListResult>('getAddresses', params as Record<string, unknown>),

  save: (data: Partial<DeliveryAddress> & { id?: string }) =>
    callFn<SaveAddressResult>('saveAddress', data as Record<string, unknown>),

  remove: (id: string) =>
    callFn<void>('deleteAddress', { id }),
}
```

- [ ] **Step 3: Commit**

```bash
git add src/api/index.ts
git commit -m "api: add couponApi and addressApi

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: 云函数 getCoupons

**Files:**
- Create: `cloudfunctions/getCoupons/package.json`
- Create: `cloudfunctions/getCoupons/index.js`

**Context:** 查询当前用户的优惠券列表，关联 `coupons` 模板表获取名称、类型等展示字段。自动将已过期但未标记的 `unused` 记录更新为 `expired`。

- [ ] **Step 1: 创建 `cloudfunctions/getCoupons/package.json`**

```json
{
  "name": "getCoupons",
  "version": "1.0.0",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 创建 `cloudfunctions/getCoupons/index.js`**

```javascript
const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({ schema: null, requireAuth: true, requireUser: true }, async (event, context, { db, openid, user, _ }) => {
  const { status, page = 1, pageSize = 20 } = event
  const now = new Date()

  // 先更新已过期的 unused 记录
  const expiredRes = await db.collection('user_coupons').where({
    openid,
    status: 'unused',
    expireAt: _.lt(now)
  }).update({
    data: { status: 'expired' }
  })

  // 构建查询条件
  const where = { openid }
  if (status) {
    where.status = status
  }

  // 分页查询
  const totalRes = await db.collection('user_coupons').where(where).count()
  const listRes = await db.collection('user_coupons')
    .where(where)
    .orderBy('status', 'asc')
    .orderBy('expireAt', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  // 关联优惠券模板信息
  const couponIds = listRes.data.map(item => item.couponId)
  let couponMap = {}
  if (couponIds.length > 0) {
    const couponRes = await db.collection('coupons').where({
      _id: _.in(couponIds)
    }).get()
    couponMap = Object.fromEntries(couponRes.data.map(c => [c._id, c]))
  }

  const list = listRes.data.map(item => {
    const coupon = couponMap[item.couponId] || {}
    return {
      id: item._id,
      couponId: item.couponId,
      name: coupon.name || '优惠券',
      type: coupon.type || 'fixed',
      value: coupon.value || 0,
      threshold: coupon.threshold || 0,
      scopeType: coupon.scopeType || 'all',
      scopeTarget: coupon.scopeTarget || '',
      status: item.status,
      expireAt: item.expireAt ? new Date(item.expireAt).toISOString() : '',
      usedAt: item.usedAt ? new Date(item.usedAt).toISOString() : undefined,
      orderId: item.orderId || undefined,
    }
  })

  return success({ list, total: totalRes.total })
})
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/getCoupons/
git commit -m "feat: add getCoupons cloud function

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: 云函数 receiveCoupon

**Files:**
- Create: `cloudfunctions/receiveCoupon/package.json`
- Create: `cloudfunctions/receiveCoupon/index.js`

**Context:** 用户领取优惠券。幂等操作——同一用户不能重复领取同一张券。

- [ ] **Step 1: 创建 `cloudfunctions/receiveCoupon/package.json`**

```json
{
  "name": "receiveCoupon",
  "version": "1.0.0",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 创建 `cloudfunctions/receiveCoupon/index.js`**

```javascript
const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    couponId: { required: true, type: 'string' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { couponId } = event

  // 检查优惠券模板是否存在且有效
  const couponRes = await db.collection('coupons').doc(couponId).get()
  if (!couponRes.data) {
    return fail('优惠券不存在')
  }
  const coupon = couponRes.data
  if (coupon.status !== 'active') {
    return fail('优惠券已下架')
  }

  // 检查是否已领取
  const existRes = await db.collection('user_coupons').where({
    openid,
    couponId
  }).count()
  if (existRes.total > 0) {
    return fail('您已领取过该优惠券')
  }

  // 计算过期时间
  const now = new Date()
  const validDays = coupon.validDays || 7
  const expireAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000)

  // 写入用户优惠券记录
  const addRes = await db.collection('user_coupons').add({
    data: {
      openid,
      couponId,
      status: 'unused',
      receivedAt: now,
      expireAt,
      usedAt: null,
      orderId: null
    }
  })

  return success({ userCouponId: addRes._id })
})
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/receiveCoupon/
git commit -m "feat: add receiveCoupon cloud function

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: 云函数 validateCoupon

**Files:**
- Create: `cloudfunctions/validateCoupon/package.json`
- Create: `cloudfunctions/validateCoupon/index.js`

**Context:** 下单前校验优惠券是否可用。校验条件：属于当前用户、未使用、未过期、满足门槛金额、满足范围限制。

- [ ] **Step 1: 创建 `cloudfunctions/validateCoupon/package.json`**

```json
{
  "name": "validateCoupon",
  "version": "1.0.0",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 创建 `cloudfunctions/validateCoupon/index.js`**

```javascript
const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    userCouponId: { required: true, type: 'string' },
    orderAmount: { required: true, type: 'number', min: 0 },
    barId: { required: false, type: 'string' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { userCouponId, orderAmount, barId } = event

  // 查询用户优惠券记录
  const ucRes = await db.collection('user_coupons').doc(userCouponId).get()
  if (!ucRes.data) {
    return success({ valid: false })
  }
  const uc = ucRes.data
  if (uc.openid !== openid) {
    return success({ valid: false })
  }
  if (uc.status !== 'unused') {
    return success({ valid: false })
  }

  const now = new Date()
  if (uc.expireAt && new Date(uc.expireAt) < now) {
    return success({ valid: false })
  }

  // 查询优惠券模板
  const couponRes = await db.collection('coupons').doc(uc.couponId).get()
  if (!couponRes.data) {
    return success({ valid: false })
  }
  const coupon = couponRes.data

  // 校验门槛
  const threshold = coupon.threshold || 0
  if (orderAmount < threshold) {
    return success({ valid: false })
  }

  // 校验范围
  if (coupon.scopeType === 'bar' && coupon.scopeTarget && coupon.scopeTarget !== barId) {
    return success({ valid: false })
  }
  // category 校验暂时不处理（需要传入 categoryIds），返回有效
  if (coupon.scopeType === 'category' && coupon.scopeTarget) {
    // 如需严格校验，此处可返回 false 要求传入 categoryIds
  }

  return success({ valid: true })
})
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/validateCoupon/
git commit -m "feat: add validateCoupon cloud function

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: 云函数 getAddresses

**Files:**
- Create: `cloudfunctions/getAddresses/package.json`
- Create: `cloudfunctions/getAddresses/index.js`

**Context:** 查询当前用户的收货地址列表，默认地址置顶。

- [ ] **Step 1: 创建 `cloudfunctions/getAddresses/package.json`**

```json
{
  "name": "getAddresses",
  "version": "1.0.0",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 创建 `cloudfunctions/getAddresses/index.js`**

```javascript
const { createHandler, success } = require('../utils')

exports.main = createHandler({ schema: null, requireAuth: true, requireUser: true }, async (event, context, { db, openid, user, _ }) => {
  const { page = 1, pageSize = 20 } = event

  const totalRes = await db.collection('delivery_address').where({ openid }).count()
  const listRes = await db.collection('delivery_address')
    .where({ openid })
    .orderBy('isDefault', 'desc')
    .orderBy('updatedAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  const list = listRes.data.map(item => ({
    id: item._id,
    name: item.name,
    phone: item.phone,
    province: item.province,
    city: item.city,
    district: item.district,
    detail: item.detail,
    isDefault: item.isDefault || false,
  }))

  return success({ list, total: totalRes.total })
})
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/getAddresses/
git commit -m "feat: add getAddresses cloud function

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: 云函数 saveAddress

**Files:**
- Create: `cloudfunctions/saveAddress/package.json`
- Create: `cloudfunctions/saveAddress/index.js`

**Context:** 新增或更新收货地址。若设为默认，自动取消其他地址的默认状态。

- [ ] **Step 1: 创建 `cloudfunctions/saveAddress/package.json`**

```json
{
  "name": "saveAddress",
  "version": "1.0.0",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 创建 `cloudfunctions/saveAddress/index.js`**

```javascript
const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    id: { required: false, type: 'string' },
    name: { required: true, type: 'string', min: 1, max: 20 },
    phone: { required: true, type: 'string', min: 1, max: 20 },
    province: { required: true, type: 'string', min: 1 },
    city: { required: true, type: 'string', min: 1 },
    district: { required: true, type: 'string', min: 1 },
    detail: { required: true, type: 'string', min: 1, max: 100 },
    isDefault: { required: false, type: 'boolean' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { id, name, phone, province, city, district, detail, isDefault = false } = event

  // 手机号简单校验
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(phone)) {
    return fail('手机号格式不正确')
  }

  const now = new Date()
  const data = {
    name,
    phone,
    province,
    city,
    district,
    detail,
    isDefault,
    updatedAt: now
  }

  if (id) {
    // 更新：先校验归属
    const existRes = await db.collection('delivery_address').doc(id).get()
    if (!existRes.data || existRes.data.openid !== openid) {
      return fail('地址不存在或无权限')
    }
    await db.collection('delivery_address').doc(id).update({ data })
  } else {
    // 新增
    const addRes = await db.collection('delivery_address').add({
      data: { ...data, openid, createdAt: now }
    })
    data._id = addRes._id
  }

  // 如果设为默认，取消其他地址的默认状态
  if (isDefault) {
    const addressId = id || data._id
    await db.collection('delivery_address').where({
      openid,
      _id: _.neq(addressId),
      isDefault: true
    }).update({
      data: { isDefault: false }
    })
  }

  return success({ addressId: id || data._id })
})
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/saveAddress/
git commit -m "feat: add saveAddress cloud function

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: 云函数 deleteAddress

**Files:**
- Create: `cloudfunctions/deleteAddress/package.json`
- Create: `cloudfunctions/deleteAddress/index.js`

**Context:** 删除收货地址，校验归属权。

- [ ] **Step 1: 创建 `cloudfunctions/deleteAddress/package.json`**

```json
{
  "name": "deleteAddress",
  "version": "1.0.0",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: 创建 `cloudfunctions/deleteAddress/index.js`**

```javascript
const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    id: { required: true, type: 'string' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { id } = event

  const existRes = await db.collection('delivery_address').doc(id).get()
  if (!existRes.data || existRes.data.openid !== openid) {
    return fail('地址不存在或无权限')
  }

  await db.collection('delivery_address').doc(id).remove()

  return success({})
})
```

- [ ] **Step 3: Commit**

```bash
git add cloudfunctions/deleteAddress/
git commit -m "feat: add deleteAddress cloud function

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: 云函数 createOrder 扩展（优惠券核销）

**Files:**
- Modify: `cloudfunctions/createOrder/index.js`

**Context:** 现有 createOrder 云函数需要扩展支持传入 `userCouponId`，下单时校验并核销优惠券。

- [ ] **Step 1: 读取现有 `cloudfunctions/createOrder/index.js` 了解当前结构**

```bash
cat cloudfunctions/createOrder/index.js
```

- [ ] **Step 2: 在参数校验 schema 中新增可选字段 `userCouponId`**

找到 schema 定义处，添加：
```javascript
userCouponId: { required: false, type: 'string' }
```

- [ ] **Step 3: 在订单数据写入前，增加优惠券核销逻辑**

在计算订单金额之后、创建订单之前，插入以下逻辑：

```javascript
let discountAmount = 0
let couponName = ''

if (event.userCouponId) {
  // 校验优惠券
  const ucRes = await db.collection('user_coupons').doc(event.userCouponId).get()
  if (!ucRes.data || ucRes.data.openid !== openid || ucRes.data.status !== 'unused') {
    return fail('优惠券无效或已使用')
  }
  const uc = ucRes.data
  const now = new Date()
  if (uc.expireAt && new Date(uc.expireAt) < now) {
    return fail('优惠券已过期')
  }

  const couponRes = await db.collection('coupons').doc(uc.couponId).get()
  if (!couponRes.data) {
    return fail('优惠券不存在')
  }
  const coupon = couponRes.data

  // 门槛校验
  if (event.totalAmount < (coupon.threshold || 0)) {
    return fail('订单金额未达到优惠券使用门槛')
  }

  // 范围校验
  if (coupon.scopeType === 'bar' && coupon.scopeTarget && coupon.scopeTarget !== event.barId) {
    return fail('优惠券不适用于该酒吧')
  }

  // 计算优惠金额
  if (coupon.type === 'fixed') {
    discountAmount = coupon.value
  } else if (coupon.type === 'threshold') {
    discountAmount = coupon.value
  } else if (coupon.type === 'discount') {
    discountAmount = Math.round(event.totalAmount * (1 - coupon.value) * 100) / 100
  }
  if (discountAmount > event.totalAmount) {
    discountAmount = event.totalAmount
  }
  couponName = coupon.name

  // 核销优惠券
  await db.collection('user_coupons').doc(event.userCouponId).update({
    data: {
      status: 'used',
      usedAt: now,
      orderId: '' // 先占位，创建订单后回填
    }
  })
}
```

- [ ] **Step 4: 创建订单后回填 orderId 到优惠券记录**

在订单创建成功（获得 `orderId` 或 `_id`）后，更新优惠券记录：

```javascript
if (event.userCouponId && orderId) {
  await db.collection('user_coupons').doc(event.userCouponId).update({
    data: { orderId }
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/createOrder/index.js
git commit -m "feat: support coupon deduction in createOrder

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: 路由常量

**Files:**
- Modify: `src/constants/routes.ts`

**Context:** 禁止硬编码路由字符串，所有路由使用 `ROUTES` 常量。

- [ ] **Step 1: 在 `ROUTES` 对象中新增新页面路由**

在 `MEMBER` 之后追加：

```typescript
  // 我的页面附属功能
  COUPONS: '/pages/coupons/index',
  ADDRESS: '/pages/address/index',
  ADDRESS_EDIT: (id?: string) =>
    `/pages/address-edit/index${id ? `?id=${id}` : ''}`,
  HELP: '/pages/help/index',
  ABOUT: '/pages/about/index',
```

- [ ] **Step 2: Commit**

```bash
git add src/constants/routes.ts
git commit -m "chore: add routes for coupons, address, help, about pages

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 13: 注册页面到 pages.json

**Files:**
- Modify: `src/pages.json`

**Context:** uni-app 需要在 `pages.json` 中声明所有页面路由。

- [ ] **Step 1: 在 `pages` 数组末尾追加 5 个新页面配置**

```json
    {
      "path": "pages/coupons/index",
      "style": {
        "navigationBarTitleText": "优惠券"
      }
    },
    {
      "path": "pages/address/index",
      "style": {
        "navigationBarTitleText": "收货地址"
      }
    },
    {
      "path": "pages/address-edit/index",
      "style": {
        "navigationBarTitleText": "编辑地址"
      }
    },
    {
      "path": "pages/help/index",
      "style": {
        "navigationBarTitleText": "帮助与反馈"
      }
    },
    {
      "path": "pages/about/index",
      "style": {
        "navigationBarTitleText": "关于我们"
      }
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/pages.json
git commit -m "chore: register new pages in pages.json

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 14: 优惠券列表页

**Files:**
- Create: `src/pages/coupons/index.vue`

**Context:** 展示用户优惠券，支持按状态筛选，可从结算页作为选择器使用。

- [ ] **Step 1: 创建页面文件**

```vue
<template>
  <view class="page">
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @tap="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="coupon-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="coupon-card"
        :class="[item.status, { selectable: selectMode }]"
        @tap="handleSelect(item)"
      >
        <view class="coupon-left" :class="item.type">
          <text class="value">{{ formatValue(item) }}</text>
        </view>
        <view class="coupon-right">
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="threshold">{{ formatThreshold(item) }}</text>
            <text class="scope">{{ formatScope(item) }}</text>
            <text class="expire">{{ formatExpire(item) }}</text>
          </view>
          <view v-if="selectMode && selectedId === item.id" class="check">
            <text>✓</text>
          </view>
          <view v-else-if="item.status !== 'unused'" class="status-tag">
            <text>{{ statusLabel[item.status] }}</text>
          </view>
        </view>
      </view>

      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-text">暂无优惠券</text>
      </view>
    </view>

    <view v-if="selectMode" class="footer">
      <button class="btn-primary" @tap="confirmSelect">确认使用</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { couponApi } from '@/api/index'
import type { UserCoupon, UserCouponStatus } from '@/types/domain'

const tabs = [
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
]

const statusLabel: Record<UserCouponStatus, string> = {
  unused: '未使用',
  used: '已使用',
  expired: '已过期',
}

const currentTab = ref<UserCouponStatus>('unused')
const list = ref<UserCoupon[]>([])
const loading = ref(false)
const selectMode = ref(false)
const selectedId = ref('')
const selectParams = ref({ orderAmount: 0, barId: '' })

const formatValue = (item: UserCoupon) => {
  if (item.type === 'discount') return `${item.value * 10}折`
  return `¥${item.value}`
}

const formatThreshold = (item: UserCoupon) => {
  if (item.threshold <= 0) return '无门槛'
  return `满${item.threshold}元可用`
}

const formatScope = (item: UserCoupon) => {
  if (item.scopeType === 'all') return '全场通用'
  if (item.scopeType === 'bar') return '指定酒吧可用'
  if (item.scopeType === 'category') return '指定分类可用'
  return ''
}

const formatExpire = (item: UserCoupon) => {
  if (!item.expireAt) return ''
  const date = item.expireAt.split('T')[0]
  return `有效期至 ${date}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await couponApi.getList({ status: currentTab.value, pageSize: 100 })
    if (selectMode.value && currentTab.value === 'unused') {
      // 筛选可用券
      list.value = res.list.filter(item => {
        if (item.status !== 'unused') return false
        if (item.threshold > selectParams.value.orderAmount) return false
        if (item.scopeType === 'bar' && item.scopeTarget && item.scopeTarget !== selectParams.value.barId) return false
        return true
      })
    } else {
      list.value = res.list
    }
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: UserCouponStatus) => {
  currentTab.value = tab
  fetchList()
}

const handleSelect = (item: UserCoupon) => {
  if (!selectMode.value || item.status !== 'unused') return
  selectedId.value = item.id
}

const confirmSelect = () => {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any
  if (prevPage && prevPage.$vm) {
    prevPage.$vm.setSelectedCoupon?.(selectedId.value)
  }
  uni.navigateBack()
}

onLoad((query) => {
  if (query?.selectMode === 'true') {
    selectMode.value = true
    selectParams.value.orderAmount = Number(query.orderAmount) || 0
    selectParams.value.barId = String(query.barId || '')
  }
  fetchList()
})

onMounted(() => {
  // uni-app onLoad 已处理
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding-bottom: 120rpx;
}

.tabs {
  display: flex;
  background-color: $bg-secondary;
  padding: 0 $spacing-md;
  margin-bottom: $spacing-md;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: $spacing-md 0;
    color: $text-secondary;
    font-size: $font-md;
    position: relative;

    &.active {
      color: $primary;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: $primary;
        border-radius: 2rpx;
      }
    }
  }
}

.coupon-list {
  padding: 0 $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.coupon-card {
  display: flex;
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  overflow: hidden;

  &.selectable {
    .coupon-right {
      padding-right: $spacing-lg;
    }
  }

  &.used,
  &.expired {
    opacity: 0.6;
  }
}

.coupon-left {
  width: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba($primary, 0.1);
  padding: $spacing-md;

  &.fixed {
    background-color: rgba($secondary-light, 0.15);
  }

  &.threshold {
    background-color: rgba($primary, 0.15);
  }

  &.discount {
    background-color: rgba($status-error, 0.15);
  }

  .value {
    font-size: $font-xl;
    font-weight: 700;
    color: $primary;
  }
}

.coupon-right {
  flex: 1;
  padding: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .info {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .name {
      font-size: $font-md;
      font-weight: 600;
      color: $text-primary;
    }

    .threshold,
    .scope,
    .expire {
      font-size: $font-sm;
      color: $text-secondary;
    }
  }

  .check {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: $primary;
    color: $on-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-sm;
  }

  .status-tag {
    padding: 4rpx 12rpx;
    background-color: $bg-primary;
    border-radius: $border-radius-sm;
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.empty {
  display: flex;
  justify-content: center;
  padding-top: 200rpx;

  .empty-text {
    color: $text-secondary;
    font-size: $font-md;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background-color: $primary;
  color: $on-primary;
  border-radius: $border-radius-full;
  font-size: $font-md;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary::after {
  border: none;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/coupons/index.vue
git commit -m "feat: add coupon list page

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 15: 收货地址列表页

**Files:**
- Create: `src/pages/address/index.vue`

**Context:** 展示用户收货地址列表，支持选择（从结算页进入时）、编辑、删除。

- [ ] **Step 1: 创建页面文件**

```vue
<template>
  <view class="page">
    <view class="address-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="address-card"
        @tap="handleSelect(item)"
      >
        <view class="header">
          <text class="name">{{ item.name }}</text>
          <text class="phone">{{ item.phone }}</text>
          <view v-if="item.isDefault" class="default-tag">
            <text>默认</text>
          </view>
        </view>
        <view class="address-text">
          <text>{{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}</text>
        </view>
        <view v-if="!selectMode" class="actions">
          <text class="action-btn" @tap.stop="goToEdit(item.id)">编辑</text>
          <text class="action-btn delete" @tap.stop="handleDelete(item)">删除</text>
        </view>
      </view>

      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-text">暂无收货地址</text>
      </view>
    </view>

    <view class="footer">
      <button class="btn-primary" @tap="goToEdit()">新增收货地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { addressApi } from '@/api/index'
import { ROUTES } from '@/constants/routes'
import { showModal, showToast } from '@/utils/feedback'
import type { DeliveryAddress } from '@/types/domain'

const list = ref<DeliveryAddress[]>([])
const loading = ref(false)
const selectMode = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await addressApi.getList({ pageSize: 100 })
    list.value = res.list
  } finally {
    loading.value = false
  }
}

const handleSelect = (item: DeliveryAddress) => {
  if (!selectMode.value) return
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any
  if (prevPage && prevPage.$vm) {
    prevPage.$vm.setSelectedAddress?.(item)
  }
  uni.navigateBack()
}

const goToEdit = (id?: string) => {
  uni.navigateTo({ url: ROUTES.ADDRESS_EDIT(id) })
}

const handleDelete = async (item: DeliveryAddress) => {
  const res = await showModal({
    title: '确认删除',
    content: '确定要删除该地址吗？',
  })
  if (!res.confirm) return

  try {
    await addressApi.remove(item.id)
    showToast({ title: '删除成功', icon: 'success' })
    fetchList()
  } catch {
    showToast({ title: '删除失败', icon: 'none' })
  }
}

onLoad((query) => {
  if (query?.selectMode === 'true') {
    selectMode.value = true
  }
})

onShow(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
  padding-bottom: 160rpx;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.address-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: $spacing-md;

  .header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;

    .name {
      font-size: $font-md;
      font-weight: 600;
      color: $text-primary;
    }

    .phone {
      font-size: $font-sm;
      color: $text-secondary;
    }

    .default-tag {
      padding: 2rpx 10rpx;
      background-color: rgba($primary, 0.1);
      border-radius: $border-radius-sm;

      text {
        font-size: 20rpx;
        color: $primary;
      }
    }
  }

  .address-text {
    font-size: $font-sm;
    color: $text-primary;
    line-height: 1.6;
    margin-bottom: $spacing-sm;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    border-top: 1px solid $border-color;
    padding-top: $spacing-sm;

    .action-btn {
      font-size: $font-sm;
      color: $text-secondary;
      padding: 4rpx 12rpx;

      &.delete {
        color: $status-error;
      }
    }
  }
}

.empty {
  display: flex;
  justify-content: center;
  padding-top: 200rpx;

  .empty-text {
    color: $text-secondary;
    font-size: $font-md;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background-color: $primary;
  color: $on-primary;
  border-radius: $border-radius-full;
  font-size: $font-md;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary::after {
  border: none;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/address/index.vue
git commit -m "feat: add address list page

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 16: 地址编辑页

**Files:**
- Create: `src/pages/address-edit/index.vue`

**Context:** 新建或编辑收货地址，含省市区选择器、默认地址开关。

- [ ] **Step 1: 创建页面文件**

```vue
<template>
  <view class="page">
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input
          v-model="form.name"
          class="input"
          placeholder="请输入收货人姓名"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="form.phone"
          class="input"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <text class="label">所在地区</text>
        <picker
          mode="region"
          :value="regionValue"
          @change="onRegionChange"
        >
          <view class="picker-value" :class="{ placeholder: !form.province }">
            {{ regionText }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <input
          v-model="form.detail"
          class="input"
          placeholder="请输入街道、楼牌号等"
          maxlength="100"
        />
      </view>

      <view class="form-item switch-item">
        <text class="label">设为默认地址</text>
        <switch
          :checked="form.isDefault"
          color="#c9a96e"
          @change="form.isDefault = ($event.detail || {}).value"
        />
      </view>
    </view>

    <view class="footer">
      <button class="btn-primary" @tap="handleSave">保存</button>
      <button v-if="isEdit" class="btn-danger" @tap="handleDelete">删除地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addressApi } from '@/api/index'
import { showToast } from '@/utils/feedback'

const form = ref({
  id: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

const isEdit = ref(false)

const regionValue = computed(() => {
  if (!form.value.province) return []
  return [form.value.province, form.value.city, form.value.district]
})

const regionText = computed(() => {
  if (!form.value.province) return '请选择省市区'
  return `${form.value.province} ${form.value.city} ${form.value.district}`
})

const onRegionChange = (e: any) => {
  const val = e.detail?.value || []
  if (val.length >= 3) {
    form.value.province = val[0]
    form.value.city = val[1]
    form.value.district = val[2]
  }
}

const validate = () => {
  if (!form.value.name.trim()) {
    showToast({ title: '请输入收货人姓名', icon: 'none' })
    return false
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(form.value.phone)) {
    showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  if (!form.value.province) {
    showToast({ title: '请选择所在地区', icon: 'none' })
    return false
  }
  if (!form.value.detail.trim()) {
    showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }
  return true
}

const handleSave = async () => {
  if (!validate()) return

  try {
    await addressApi.save({
      id: isEdit.value ? form.value.id : undefined,
      name: form.value.name.trim(),
      phone: form.value.phone,
      province: form.value.province,
      city: form.value.city,
      district: form.value.district,
      detail: form.value.detail.trim(),
      isDefault: form.value.isDefault,
    })
    showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch {
    showToast({ title: '保存失败', icon: 'none' })
  }
}

const handleDelete = async () => {
  if (!form.value.id) return
  try {
    await addressApi.remove(form.value.id)
    showToast({ title: '删除成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch {
    showToast({ title: '删除失败', icon: 'none' })
  }
}

onLoad((query) => {
  if (query?.id) {
    isEdit.value = true
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] as any
    const target = prevPage?.$vm?.list?.find((a: any) => a.id === query.id)
    if (target) {
      form.value = { ...target, id: query.id }
    }
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding-bottom: 240rpx;
}

.form {
  background-color: $bg-secondary;
  margin: $spacing-md;
  border-radius: $border-radius-xl;
  padding: 0 $spacing-md;
}

.form-item {
  display: flex;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  .label {
    width: 160rpx;
    font-size: $font-md;
    color: $text-primary;
    flex-shrink: 0;
  }

  .input {
    flex: 1;
    font-size: $font-md;
    color: $text-primary;
  }

  .picker-value {
    flex: 1;
    font-size: $font-md;
    color: $text-primary;

    &.placeholder {
      color: $text-secondary;
    }
  }
}

.switch-item {
  justify-content: space-between;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background-color: $primary;
  color: $on-primary;
  border-radius: $border-radius-full;
  font-size: $font-md;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary::after {
  border: none;
}

.btn-danger {
  width: 100%;
  height: 88rpx;
  background-color: transparent;
  color: $status-error;
  border-radius: $border-radius-full;
  font-size: $font-md;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba($status-error, 0.3);
}

.btn-danger::after {
  border: none;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/address-edit/index.vue
git commit -m "feat: add address edit page

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 17: 帮助与反馈页

**Files:**
- Create: `src/pages/help/index.vue`

**Context:** 纯静态内容，使用折叠面板展示常见问题。

- [ ] **Step 1: 创建页面文件**

```vue
<template>
  <view class="page">
    <view class="help-group">
      <view class="group-title">下单流程</view>
      <view class="help-item">
        <view class="question">如何下单？</view>
        <view class="answer">浏览酒吧或商品详情页，选择商品加入购物车，进入结算页确认订单信息后支付即可。</view>
      </view>
      <view class="help-item">
        <view class="question">支持哪些支付方式？</view>
        <view class="answer">目前仅支持微信支付。</view>
      </view>
      <view class="help-item">
        <view class="question">如何取消订单？</view>
        <view class="answer">在"我的订单"中找到待支付或待使用的订单，点击取消即可。已支付订单请联系客服处理。</view>
      </view>
    </view>

    <view class="help-group">
      <view class="group-title">配送说明</view>
      <view class="help-item">
        <view class="question">配送范围是多大？</view>
        <view class="answer">目前支持同城配送，具体范围以各酒吧实际服务范围为准。</view>
      </view>
      <view class="help-item">
        <view class="question">配送时间是多久？</view>
        <view class="answer">下单后一般1-2小时内送达，高峰期可能略有延迟。</view>
      </view>
    </view>

    <view class="help-group">
      <view class="group-title">退换规则</view>
      <view class="help-item">
        <view class="question">未使用可以退款吗？</view>
        <view class="answer">未使用的订单可在订单详情中申请退款，审核通过后原路退回。</view>
      </view>
    </view>

    <view class="help-group">
      <view class="group-title">账户安全</view>
      <view class="help-item">
        <view class="question">如何修改个人信息？</view>
        <view class="answer">进入"我的"页面，点击头像区域即可进入个人资料编辑页。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 纯静态页面，无需逻辑
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
}

.help-group {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: 0 $spacing-md;
  margin-bottom: $spacing-md;

  .group-title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color;
  }
}

.help-item {
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  .question {
    font-size: $font-md;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .answer {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.6;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/help/index.vue
git commit -m "feat: add help and feedback page

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 18: 关于我们页

**Files:**
- Create: `src/pages/about/index.vue`

**Context:** 纯静态信息展示，包含平台介绍和客服电话。

- [ ] **Step 1: 创建页面文件**

```vue
<template>
  <view class="page">
    <view class="header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">酒吧聚合平台</text>
      <text class="version">版本 {{ version }}</text>
    </view>

    <view class="intro-card">
      <text class="intro-title">平台简介</text>
      <text class="intro-text">
        我们是一家专注于酒吧/夜店聚合消费的平台，致力于为用户提供便捷的预订、点单和社交服务。无论您想寻找附近的热门酒吧，还是与志同道合的朋友组局畅饮，我们都能满足您的需求。
      </text>
    </view>

    <view class="contact-card">
      <view class="contact-item" @tap="makePhoneCall">
        <text class="label">客服电话</text>
        <text class="value">400-888-9999</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const version = ref('1.0.0')

// 如需从 manifest.json 读取版本号，可使用 uni.getAppAuthorizeSetting 或编译时注入
// 这里简单写死，实际项目可扩展

const makePhoneCall = () => {
  uni.makePhoneCall({ phoneNumber: '4008889999' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: $spacing-md;
  }

  .app-name {
    font-size: $font-xl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .version {
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.intro-card,
.contact-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.intro-title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-sm;
}

.intro-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    font-size: $font-md;
    color: $text-primary;
  }

  .value {
    font-size: $font-md;
    color: $primary;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/about/index.vue
git commit -m "feat: add about us page

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 19: 修正 mine/index.vue 跳转

**Files:**
- Modify: `src/pages/mine/index.vue`

**Context:** 现有跳转方法使用硬编码字符串，需替换为 `ROUTES` 常量。

- [ ] **Step 1: 在 `script setup` 顶部添加 `ROUTES` 导入**

```typescript
import { ROUTES } from '@/constants/routes'
```

- [ ] **Step 2: 替换四个跳转方法**

找到：
```typescript
const goToCoupons = () => { uni.navigateTo({ url: '/pages/coupons/index' }) }
const goToAddress = () => { uni.navigateTo({ url: '/pages/address/index' }) }
const goToHelp = () => { uni.navigateTo({ url: '/pages/help/index' }) }
const goToAbout = () => { uni.navigateTo({ url: '/pages/about/index' }) }
```

替换为：
```typescript
const goToCoupons = () => { uni.navigateTo({ url: ROUTES.COUPONS }) }
const goToAddress = () => { uni.navigateTo({ url: ROUTES.ADDRESS }) }
const goToHelp = () => { uni.navigateTo({ url: ROUTES.HELP }) }
const goToAbout = () => { uni.navigateTo({ url: ROUTES.ABOUT }) }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/mine/index.vue
git commit -m "refactor: use ROUTES constants in mine page navigation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 20: 构建与验证

**Files:**
- 所有已修改/新增文件

**Context:** 确保代码编译通过，类型检查无错误。

- [ ] **Step 1: 执行类型检查**

```bash
npm run type-check
```

Expected: `vue-tsc --noEmit` 无类型错误。若出现 `UserCoupon` 等类型未找到的错误，检查 `src/types/domain.ts` 是否正确导出、以及 `src/api/index.ts` 是否已正确导入。

- [ ] **Step 2: 执行代码检查**

```bash
npm run lint
```

Expected: 无 error（warning 需确认合理）。特别注意云函数中可能存在的 ESLint 忽略问题——云函数在 `cloudfunctions/` 目录，若 ESLint 配置未包含该目录则不会检查。

- [ ] **Step 3: 执行小程序构建**

```bash
npm run build:mp-weixin
```

Expected: 编译成功，无错误。检查 `dist/build/mp-weixin/pages/` 下是否生成了新页面的编译产物。

- [ ] **Step 4: 执行一键构建脚本**

```bash
bash scripts/build-mp-weixin.sh
```

Expected: 脚本成功执行，新云函数被复制到 `dist/build/mp-weixin/cloudfunctions/`。

- [ ] **Step 5: 最终 Commit**

```bash
git add .
git commit -m "feat: 完成「我的」页面附属功能（优惠券、收货地址、帮助与反馈、关于我们）

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec 要求 | 对应 Task |
|-----------|-----------|
| 数据库集合 `coupons`, `user_coupons`, `delivery_address` | Task 1 |
| 领域类型 `Coupon`, `UserCoupon`, `DeliveryAddress` | Task 2 |
| API 返回类型 | Task 3 |
| API 层 `couponApi`, `addressApi` | Task 4 |
| 云函数 `getCoupons` | Task 5 |
| 云函数 `receiveCoupon` | Task 6 |
| 云函数 `validateCoupon` | Task 7 |
| 云函数 `getAddresses` | Task 8 |
| 云函数 `saveAddress` | Task 9 |
| 云函数 `deleteAddress` | Task 10 |
| 下单时核销优惠券 | Task 11 |
| 优惠券列表页（含选择模式） | Task 14 |
| 收货地址列表页 | Task 15 |
| 地址编辑页（含省市区选择） | Task 16 |
| 帮助与反馈页 | Task 17 |
| 关于我们页 | Task 18 |
| 路由常量 | Task 12 |
| 页面注册 | Task 13 |
| mine 页跳转修正 | Task 19 |

**Gap:** checkout 页联动优惠券和地址的修改未在本次计划中包含，因为涉及现有结算页逻辑调整，可作为独立后续任务。

### Placeholder Scan

- [x] 无 "TBD", "TODO", "implement later"
- [x] 无 "Add appropriate error handling" 等模糊描述
- [x] 每个任务包含完整代码
- [x] 无 "Similar to Task N" 引用

### Type Consistency

- [x] `CouponType`, `CouponScopeType`, `UserCouponStatus` 在 domain.ts 中定义，被 api.ts 和 api/index.ts 引用
- [x] 云函数返回值字段名与 `api.ts` 中类型一致
- [x] `DeliveryAddress` 字段在云函数和前端一致

