# 「我的」页面附属功能设计文档

## 1. 背景与目标

当前「我的」页面（`pages/mine/index.vue`）已预留了四个功能入口的 UI：优惠券、收货地址、帮助与反馈、关于我们。但对应的页面和后台接口均未实现。本设计补齐这四个功能的完整实现。

## 2. 新增页面

| 页面路径 | 说明 |
|---------|------|
| `pages/coupons/index.vue` | 优惠券列表页，支持按状态筛选；在结算页可作为选择器使用 |
| `pages/address/index.vue` | 收货地址列表页，支持设为默认、编辑、删除 |
| `pages/address-edit/index.vue` | 新建/编辑收货地址页，含省市区选择器 |
| `pages/help/index.vue` | 帮助与反馈，静态内容折叠展示 |
| `pages/about/index.vue` | 关于我们，静态信息展示 |

## 3. 数据库集合

### 3.1 `coupons`（全局优惠券模板）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 券名称，如「新人立减券」 |
| `type` | string | `fixed`(固定金额) / `threshold`(满减) / `discount`(折扣) |
| `value` | number | 面额或折扣值（如 20 或 0.8） |
| `threshold` | number | 使用门槛金额，0 表示无门槛 |
| `scopeType` | string | `all`(全场) / `bar`(指定酒吧) / `category`(指定分类) |
| `scopeTarget` | string | 当 scopeType 不为 all 时，对应酒吧 ID 或分类 ID |
| `validDays` | number | 领取后有效天数 |
| `status` | string | `active` / `inactive` |
| `createdAt` | Date | 创建时间 |

### 3.2 `user_coupons`（用户领取记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| `openid` | string | 用户 OPENID |
| `couponId` | string | 关联 coupons._id |
| `status` | string | `unused` / `used` / `expired` |
| `receivedAt` | Date | 领取时间 |
| `expireAt` | Date | 过期时间 |
| `usedAt` | Date | 使用时间（可选） |
| `orderId` | string | 使用后关联订单 ID（可选） |

### 3.3 `delivery_address`（收货地址）

| 字段 | 类型 | 说明 |
|------|------|------|
| `openid` | string | 用户 OPENID |
| `name` | string | 收货人姓名 |
| `phone` | string | 手机号 |
| `province` | string | 省 |
| `city` | string | 市 |
| `district` | string | 区/县 |
| `detail` | string | 详细地址 |
| `isDefault` | boolean | 是否默认地址 |
| `createdAt` | Date | 创建时间 |
| `updatedAt` | Date | 更新时间 |

### 3.4 索引配置（database/init.json）

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

## 4. 云函数设计

### 4.1 `getCoupons`

- **入参**: `{ status?: 'unused' | 'used' | 'expired', page?: number, pageSize?: number }`
- **逻辑**: 查询当前用户(user_coupons) + 关联优惠券模板(coupons)信息。若 status 为 `unused`，自动排除已过期的记录；若未传 status，返回全部。
- **返回**: `{ success: boolean, list: UserCoupon[], total: number }`

`UserCoupon` 结构展开后包含：`id`, `couponId`, `name`, `type`, `value`, `threshold`, `scopeType`, `scopeTarget`, `status`, `expireAt`, `usedAt`。

### 4.2 `receiveCoupon`

- **入参**: `{ couponId: string }`
- **逻辑**: 幂等领取。先查 `coupons` 确认存在且 `active`，再查 `user_coupons` 确认未领取过，然后写入记录并计算 `expireAt = now + validDays`。
- **返回**: `{ success: boolean, userCouponId: string }`

### 4.3 `validateCoupon`

- **入参**: `{ userCouponId: string, orderAmount: number, barId?: string, categoryIds?: string[] }`
- **逻辑**: 校验券是否属于当前用户、未过期未使用、满足使用门槛、满足范围限制。
- **返回**: `{ success: boolean, valid: boolean, error?: string }`

### 4.4 `getAddresses`

- **入参**: `{ page?: number, pageSize?: number }`
- **逻辑**: 查询当前用户地址，按 `isDefault` 降序 + `updatedAt` 降序排列。
- **返回**: `{ success: boolean, list: Address[], total: number }`

### 4.5 `saveAddress`

- **入参**: `{ id?: string, name: string, phone: string, province: string, city: string, district: string, detail: string, isDefault?: boolean }`
- **逻辑**: 若传 `id` 则更新，否则新增。若 `isDefault` 为 true，先将该用户其他地址的 `isDefault` 设为 false。
- **返回**: `{ success: boolean, addressId: string }`

### 4.6 `deleteAddress`

- **入参**: `{ id: string }`
- **逻辑**: 删除指定地址，同时校验属于当前用户。
- **返回**: `{ success: boolean }`

### 4.7 `useCoupon`（内部或独立）

- 在 `createOrder` 云函数内部调用或作为子流程：下单时传入 `userCouponId`，校验通过后更新 `user_coupons` status 为 `used`，并回填 `usedAt` 和 `orderId`。

## 5. 前端设计

### 5.1 优惠券列表页（`coupons/index.vue`）

**布局：**
- 顶部 Tab 栏：未使用 / 已使用 / 已过期
- 列表卡片：左侧色带标识类型（金色=满减，红色=折扣，蓝色=固定金额），中间展示名称/门槛/有效期/适用范围，右侧状态标签
- 空状态：对应图标 + 文案

**交互：**
- 点击 Tab 切换状态，重新拉取数据
- 若从结算页进入（`selectMode=true`），卡片变为单选样式，底部显示「确认使用」按钮，点击后通过 `eventChannel` 或 `navigateBack` 回传 `couponId`

**数据流：**
```
onShow -> 读取 query.selectMode -> 调用 couponApi.getList(status) -> 渲染列表
```

### 5.2 收货地址列表页（`address/index.vue`）

**布局：**
- 地址卡片：姓名 + 电话（右侧），下方完整地址（省市区+详细），默认地址标签
- 底部固定安全区按钮：「新增收货地址」

**交互：**
- 点击卡片：若从结算页进入（`selectMode=true`），回传该地址并返回；否则进入编辑页
- 编辑按钮：跳转 `address-edit?id=xxx`
- 删除按钮：二次确认后调用 `deleteAddress` 并刷新列表

### 5.3 地址编辑页（`address-edit/index.vue`）

**布局：**
- 表单列表：收货人、手机号、所在地区（picker，mode="region"）、详细地址
- 默认地址开关（uni-app `switch`）
- 底部按钮：保存（primary），编辑模式下显示「删除地址」（danger）

**校验规则：**
- 姓名：1-20 字符，不能为空
- 手机号：大陆手机号正则
- 省市区：必须选择
- 详细地址：1-100 字符

### 5.4 帮助与反馈页（`help/index.vue`）

**布局：**
- 顶部搜索栏（可选，v1 可先不做）
- 折叠面板（uni-collapse）：
  - 下单流程（如何下单、支付、取消）
  - 配送说明（配送范围、时间、费用）
  - 退换规则（退款条件、流程）
  - 账户安全（密码、登录问题）

**内容**：纯静态文本，写死在页面中，不需要云函数。

### 5.5 关于我们页（`about/index.vue`）

**布局：**
- 顶部：Logo + 平台名称 + 版本号（从 `manifest.json` 读取）
- 简介：一段平台介绍文案
- 联系信息：客服电话（点击 `uni.makePhoneCall`）

**内容**：纯静态。

## 6. 类型定义

在 `src/types/domain.ts` 中新增：

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

在 `src/types/api.ts` 中新增对应的返回类型。

## 7. API 层（`src/api/index.ts`）

新增 `couponApi` 和 `addressApi`：

```typescript
export const couponApi = {
  getList: (params?: { status?: UserCouponStatus; page?: number; pageSize?: number }) =>
    callFn<{ list: UserCoupon[]; total: number }>('getCoupons', params),
  receive: (couponId: string) =>
    callFn<{ userCouponId: string }>('receiveCoupon', { couponId }),
  validate: (data: { userCouponId: string; orderAmount: number; barId?: string }) =>
    callFn<{ valid: boolean }>('validateCoupon', data),
}

export const addressApi = {
  getList: (params?: { page?: number; pageSize?: number }) =>
    callFn<{ list: DeliveryAddress[]; total: number }>('getAddresses', params),
  save: (data: Partial<DeliveryAddress> & { id?: string }) =>
    callFn<{ addressId: string }>('saveAddress', data),
  remove: (id: string) =>
    callFn<void>('deleteAddress', { id }),
}
```

## 8. 与结算页的联动

在 `pages/checkout/index.vue` 中：

1. **地址展示**：加载默认地址（调用 `addressApi.getList`），显示「姓名 电话 省市区详细地址」。点击区域进入 `address?selectMode=true`，选择后回传更新。
2. **优惠券展示**：加载可用券列表（`couponApi.getList({ status: 'unused' })`），按「面额最大且满足门槛」排序，默认推荐第一张。点击区域进入 `coupons?selectMode=true&orderAmount=xxx&barId=xxx`，选择后回传。

`createOrder` 云函数扩展入参支持 `userCouponId`，下单时内部调用 `validateCoupon` 逻辑并核销。

## 9. 样式规范

- 使用 `src/styles/variables.scss` 中的 SCSS 变量，禁止硬编码色值
- 页面内尺寸优先使用 `rpx`
- 类名遵循 BEM-like 命名

## 10. 安全与异常

- 所有云函数必须使用 `createHandler` 包装，鉴权通过 `OPENID`
- `saveAddress` 中手机号使用正则校验
- `deleteAddress` 校验记录 `openid` 与当前用户一致
- `receiveCoupon` 防止重复领取（`openid` + `couponId` 唯一约束）
