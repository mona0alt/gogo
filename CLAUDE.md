# 酒吧聚合平台小程序

**AppID:** `wxea6875f5c19de652`
**Cloud Environment ID:** `cloud1-d3gjrsyla8bdd9f4a`

---

## 1. 项目概况

一个基于微信生态的酒吧/夜店聚合消费平台。用户可浏览酒吧列表、查看酒品、加入购物车、下单购买，并在"我的"页面管理订单和个人资料。

- **页面数量**: 10 个
- **云函数数量**: 25 个
- **TabBar**: 首页、点单、订单、我的（共 4 个）

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Vue 3 + uni-app (alpha-50007) + Vite | 编译到微信小程序为主，同时保留 H5 构建能力 |
| **状态管理** | Pinia 2.1.7 | 用户状态、购物车、订单等；使用 `persistPlugin` 自动同步 Storage |
| **样式** | SCSS | 使用 `$variables` 变量系统（`styles/variables.scss`） |
| **类型系统** | TypeScript 5.8 | 所有 Store、API、组件均使用类型；禁止裸 `any` |
| **后端** | 微信云开发 | 云函数 (Node.js) + 云数据库 (MongoDB) + 云存储 |
| **构建工具** | 自定义 Bash 脚本 | `scripts/build-mp-weixin.sh` 自动配置 AppID 和云环境 |
| **代码质量** | ESLint 9 + @typescript-eslint + Prettier | `no-console` 在生产环境报错；TypeScript parser 支持 Vue SFC |

---

## 3. 项目结构

```
bar-platform-miniapp/
├── src/
│   ├── pages/              # 页面
│   ├── components/         # 公共组件
│   ├── stores/             # Pinia 状态管理
│   │   └── plugins/
│   │       └── persist.ts  # Pinia 自动持久化插件
│   ├── api/                # API 层（类型安全的云函数调用）
│   ├── types/              # 核心领域类型 + API 返回类型
│   │   ├── domain.ts       # User, Bar, Product, Order, Group 等
│   │   └── api.ts          # 各云函数返回类型
│   ├── composables/        # 可复用组合式函数
│   ├── constants/          # 常量（路由、配置等）
│   ├── utils/              # 工具函数
│   └── styles/             # 样式变量与公共样式
├── cloudfunctions/         # 云函数
│   └── utils/
│       └── index.js        # 公共工具：createHandler, validate, rateLimit 等
├── database/
│   └── init.json           # 数据库集合与索引初始化配置
├── scripts/                # 构建脚本
└── dist/build/mp-weixin    # 编译输出
```

---

## 4. 编码规范

### 4.1 TypeScript 规范

- **禁用裸 `any`**。函数参数和返回值必须显式标注类型；确需宽松类型时使用 `Record<string, unknown>` 或合适的联合类型。
- **优先使用 `src/types/domain.ts` 中的领域类型**。新增业务实体前先在 `domain.ts` 中定义接口，再在 `api.ts` 中定义云函数返回类型。
- **云函数返回类型必须扁平**。即 `{ success: boolean; data?: T; error?: string }` 的结构在实际返回中直接展开为 `{ success: boolean; ...T }`，Store 和 API 层按此约定消费。

### 4.2 Vue / uni-app 规范

- **`<script setup lang="ts">`**。所有页面和组件统一使用 Composition API + TypeScript。
- **组件 Props 使用领域类型**。例如 `import type { Order } from '@/types/domain'` 而不是本地重新定义 `interface Order`。
- **避免在模板中写复杂表达式**。将计算逻辑移到 `<script>` 中的 `computed`。
- **catch 块中不保留未使用的错误变量**。例如 `catch { ... }` 而不是 `catch (e: any) { ... }`（ESLint 会报错）。
- **页面内直接调用 API 时，优先使用 `callCloudFunction`**。若需类型安全，则通过 `src/api/index.ts` 中的 `xxxApi` 对象调用。

### 4.3 API 层规范

- **所有云函数调用统一收口到 `src/api/index.ts`**。按领域分组为 `authApi`、`barApi`、`productApi`、`cartApi`、`orderApi`、`groupApi`、`matchApi`、`followApi`。
- **单个 API 文件（如 `auth.ts`）只做 re-export**。保持向后兼容，不重复实现调用逻辑。
- **`src/utils/request.ts` 中的 `callCloudFunction`** 已统一处理 `success` 字段判定和错误转换。业务代码不直接调用 `wx.cloud.callFunction`。

### 4.4 状态管理规范

- **每个 Store 对应一个领域**，状态接口必须显式声明类型。
- **不再手动调用 `uni.setStorageSync`**。`src/stores/plugins/persist.ts` 会自动将所有 Store 状态同步到 Storage。
- **Store Action 返回 Promise**。错误在调用方处理，Store 内只抛异常不弹 Toast。

### 4.5 路由规范

- **禁止硬编码路由字符串**。所有路由使用 `src/constants/routes.ts` 中的 `ROUTES` 常量。
- **需要登录的跳转使用 `useNavigation()` 组合式函数**。它会自动检查登录态并跳转到登录页。

### 4.6 样式规范

- **使用 SCSS 变量**。变量定义在 `src/styles/variables.scss` 中，禁止页面内写死色值或尺寸。
- **类名使用 BEM-like 命名**。例如 `.order-card__header`、`.btn--primary`。
- **尺寸单位优先使用 `rpx`**。固定元素（如安全区）可使用 `px`。

---

## 5. 云函数规范

### 5.1 必须使用 `createHandler` 包装

所有云函数入口统一使用 `cloudfunctions/utils/index.js` 提供的 `createHandler`：

```javascript
const { createHandler, success, fail } = require('../utils')

const schema = {
  barId: { required: true, type: 'string' },
  totalAmount: { required: true, type: 'number', min: 0 }
}

exports.main = createHandler({ schema, requireUser: true }, async (event, context, { db, openid, user, _ }) => {
  // 业务逻辑
  return success({ orderId: res._id })
})
```

- `schema`：入参校验规则。支持 `required`, `type`, `enum`, `min`, `max`。
- `requireAuth`（默认 `true`）：是否必须获取到 OPENID。
- `requireUser`（默认 `true`）：是否自动查询 `users` 表并将用户注入 `user`。
- `createHandler` 内部已统一捕获异常并处理 `DATABASE_COLLECTION_NOT_EXIST`。

### 5.2 错误处理

- 业务错误使用 `fail('xxx')` 返回，HTTP 状态始终 200。
- 不直接在云函数内 `console.error` 后吞掉异常；`createHandler` 已统一打印并包装。
- 云函数返回值必须包含 `success: boolean`。

### 5.3 安全规范

- **限流**：敏感操作（登录、关注、发送邀请）使用 `rateLimit(db, key, max, windowSeconds)`。
- **幂等性**：写操作（如创建订单）支持传入 `idempotencyKey`，后端先做唯一性检查再写入。
- **鉴权**：所有涉及用户数据的操作必须通过 `cloud.getWXContext().OPENID` 获取身份，禁止信任前端传入的 `userId`。

### 5.4 数据库操作

- **查询条件优先使用复合索引**。新增高频查询场景时，同步更新 `database/init.json` 中的索引配置。
- **批量写入/更新使用事务**（如订单创建 + 购物车清空）。当前未接入事务时，确保失败后的数据一致性在业务层面可接受。

### 5.5 新建云函数 checklist

1. 在 `cloudfunctions/<name>/` 下创建 `index.js` 和 `package.json`（必须包含 `wx-server-sdk` 依赖）。
2. 使用 `createHandler` 包装入口。
3. 如有新集合，在 `database/init.json` 中补充索引。
4. 执行 `bash scripts/build-mp-weixin.sh` 复制到构建目录。
5. 在微信开发者工具中右键云函数文件夹 → "上传并部署：云端安装依赖"。

---

## 6. 云数据库集合

| 集合 | 权限 | 说明 |
|------|------|------|
| `bars` | 所有人可读 | 酒吧数据 |
| `categories` | 所有人可读 | 分类数据 |
| `products` | 所有人可读 | 商品数据 |
| `users` | 仅创建者读写 | 用户数据 |
| `cart_items` | 仅创建者读写 | 购物车 |
| `orders` | 仅创建者读写 | 订单 |
| `groups` | 仅创建者读写 | 拼团 |
| `group_matches` | 仅创建者读写 | 组局配对请求 |
| `follows` | 仅创建者读写 | 关注关系 |
| `rate_limits` | 仅创建者读写 | 限流记录（自动清理） |

### 6.1 复合索引列表

| 集合 | 索引名 | 字段 |
|------|--------|------|
| `groups` | `status_creator` | `status`, `creatorOpenid` |
| `groups` | `status_createdAt` | `status`, `createdAt` |
| `groups` | `creatorOpenid_status` | `creatorOpenid`, `status` |
| `group_matches` | `groupId_status` | `groupId`, `status` |
| `group_matches` | `fromOpenid_status_createdAt` | `fromOpenid`, `status`, `createdAt` |
| `group_matches` | `toOpenid_status` | `toOpenid`, `status` |
| `follows` | `follower_following` | `followerOpenid`, `followingOpenid` (unique) |
| `follows` | `follower_createdAt` | `followerOpenid`, `createdAt` |

---

## 7. 构建流程

### 标准命令
```bash
# 开发
npm run dev:mp-weixin

# 生产构建
npm run build:mp-weixin

# H5
npm run dev:h5 / npm run build:h5

# 代码检查
npm run type-check   # vue-tsc --noEmit
npm run lint         # eslint .
```

### 一键构建脚本（推荐）
```bash
bash scripts/build-mp-weixin.sh
```
该脚本会：
1. 自动将 `src/manifest.json` 的 `appid` 替换为 `wxe2bf2dbecd72b3ac`
2. 执行 `npm install` + `npm run build:mp-weixin`
3. 复制 `cloudfunctions/` 到 `dist/build/mp-weixin/`
4. 在 `project.config.json` 中注入云开发环境配置

### 部署要点
- **小程序前端**：用微信开发者工具导入 `dist/build/mp-weixin`
- **云函数**：修改后必须在开发者工具中右键对应文件夹 → **"上传并部署"**
- **数据库初始化**：部署 `initDatabase` 云函数后，调用并传入 `action: 'init'`

---

## 8. 开发范式

### 数据流向
```
用户操作 → callCloudFunction / api.xxx → 云函数 → 云数据库
                ↑                              ↓
            返回结果 ← ────────────────────────┘
```

### 状态管理
- `userStore`、`cartStore`、`orderStore`、`barStore` 均使用 Pinia + `persistPlugin` 自动持久化。
- tabBar 页面（尤其是 `mine`）通过 `onShow` 从 storage 恢复状态，以解决页面缓存导致的数据不同步问题。

### 可复用逻辑抽取
- **头像上传**：使用 `useAvatarUpload()` composable，不再在页面内直接调用 `wx.cloud.uploadFile`。
- **导航守卫**：使用 `useNavigation()` composable，自动处理登录拦截。

---

## 9. 注意事项 & 已知坑

### A. 微信隐私政策限制（头像/昵称）
- `uni.getUserProfile` 和 `getUserInfo` 已**无法返回真实头像和昵称**，统一返回默认值（昵称：`微信用户`，头像：官方默认灰头像）。
- 当前采用 **「头像昵称填写」** 能力作为替代方案：
  - `<button open-type="chooseAvatar">` 让用户手动选择头像
  - `<input type="nickname">` 让用户手动输入昵称
  - 头像上传到**微信云存储**获取持久化 `fileID`

### B. uni-app Vue3 + mp-weixin tabBar 页面渲染 Bug
- 在 tabBar 页面的 `onShow` 中直接更新 `ref` / `computed`，经常无法触发 WXML 的 `setData` 刷新。
- **当前 workaround**：`mine` 页面使用 `v-if` 延迟挂载（先 `false` 隐藏，500ms 后再 `true` 显示），强制微信小程序销毁旧 DOM 并创建新节点，从而绕过这个时序 bug。

### C. `uni.login` 的 code 有效期
- `code` 有效期约 5 分钟，必须在获取后尽快使用。
- 当前登录流程：用户先填写头像/昵称，点击「确认登录」时才调用 `uni.login`，避免 code 过期。

### D. 样式兼容性
- 编译器使用 `sass`，但当前代码中仍大量使用 `@import`（已被标记为 deprecation warning），未来升级 Sass 3.0 时可能需要改为 `@use`。

### E. 权限与数据安全
- 云数据库集合（`users`、`cart_items`、`orders`）的权限设置为 **"仅创建者读写"**。
- 敏感操作（如登录）通过云函数获取 `cloud.getWXContext().OPENID`，无需前端暴露 `appSecret`。

---

## 10. 开发规则

**每次修改完代码后必须重新构建：**
- 小程序端修改完成后：执行 `npm run build:mp-weixin`
- 云函数修改完成后：在微信开发者工具中右键云函数文件夹 → "上传并部署"
- 确保每次修改后的代码都能正常编译通过后再报告完成

### 新建云函数的规范

1. **每个云函数必须有 `package.json`**：包含 `name`、`version` 和 `wx-server-sdk` 依赖。例如：
   ```json
   {
     "name": "cloudFunctionName",
     "version": "1.0.0",
     "dependencies": {
       "wx-server-sdk": "~2.6.3"
     }
   }
   ```
2. **新建云函数后必须重新构建**：执行 `bash scripts/build-mp-weixin.sh`，确保新云函数被复制到 `dist/build/mp-weixin/`。
3. **上传并部署**：在微信开发者工具中右键新建的云函数文件夹 → "上传并部署：云端安装依赖"。

### 代码提交 checklist

- [ ] `npm run type-check` 无类型错误
- [ ] `npm run lint` 无 error（warning 需确认合理）
- [ ] `npm run build:mp-weixin` 编译成功
- [ ] 新增/修改的云函数已部署到微信云开发
