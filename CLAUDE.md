# 酒吧聚合平台小程序

**AppID:** `wxe2bf2dbecd72b3ac`
**Cloud Environment ID:** `cloud1-d3gjrsyla8bdd9f4a`

---

## 1. 项目概况

一个基于微信生态的酒吧/夜店聚合消费平台。用户可浏览酒吧列表、查看酒品、加入购物车、下单购买，并在"我的"页面管理订单和个人资料。

- **页面数量**: 10 个
- **云函数数量**: 13 个
- **TabBar**: 首页、点单、订单、我的（共 4 个）

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Vue 3 + uni-app (alpha-50007) + Vite | 编译到微信小程序为主，同时保留 H5 构建能力 |
| **状态管理** | Pinia 2.1.7 | 用户状态、购物车、订单等 |
| **样式** | SCSS | 使用 `$variables` 变量系统（`styles/variables.scss`） |
| **后端** | 微信云开发 | 云函数 (Node.js) + 云数据库 (MongoDB) + 云存储 |
| **构建工具** | 自定义 Bash 脚本 | `scripts/build-mp-weixin.sh` 自动配置 AppID 和云环境 |

---

## 3. 项目结构

```
bar-platform-miniapp/
├── src/
│   ├── pages/           # 页面 (10个)
│   ├── components/      # 组件 (4个)
│   ├── stores/          # Pinia 状态管理 (5个)
│   ├── api/             # API 层 (6个)
│   ├── utils/           # 工具函数
│   └── styles/          # 样式
├── cloudfunctions/      # 云函数 (13个)
├── database/            # 数据库初始化脚本
├── scripts/             # 构建脚本
└── dist/build/mp-weixin # 编译输出
```

---

## 4. 云函数列表

| 云函数 | 功能 |
|--------|------|
| `login` | 微信登录，获取 openid |
| `getBarList` | 酒吧列表 |
| `getBarDetail` | 酒吧详情 |
| `getCategories` | 商品分类 |
| `getProductList` | 商品列表 |
| `cart` | 购物车增删改查 |
| `createOrder` | 创建订单 |
| `getOrders` | 订单列表 |
| `getOrderDetail` | 订单详情 |
| `getPayParams` | 支付参数 |
| `initDatabase` | 数据库初始化 |
| `bindPhone` | 绑定手机号 |

---

## 5. 云数据库集合

| 集合 | 权限 | 说明 |
|------|------|------|
| `bars` | 所有人可读 | 酒吧数据 |
| `categories` | 所有人可读 | 分类数据 |
| `products` | 所有人可读 | 商品数据 |
| `users` | 仅创建者读写 | 用户数据 |
| `cart_items` | 仅创建者读写 | 购物车 |
| `orders` | 仅创建者读写 | 订单 |

---

## 6. 构建流程

### 标准命令
```bash
# 开发
npm run dev:mp-weixin

# 生产构建
npm run build:mp-weixin

# H5
npm run dev:h5 / npm run build:h5
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

## 7. 开发范式

### 数据流向
```
用户操作 → wx.cloud.callFunction() → 云函数 → 云数据库
                ↑                         ↓
            返回结果 ← ──────────────────┘
```

### 状态管理
- `userStore` 在登录时将 `token`、`userId`、`userInfo` 同步写入 `uni.setStorageSync`，保证小程序重启后状态不丢失。
- tabBar 页面（尤其是 `mine`）通过 `onShow` 从 storage 恢复状态，以解决页面缓存导致的数据不同步问题。

---

## 8. 注意事项 & 已知坑

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

## 9. 开发规则

**每次修改完代码后必须重新构建：**
- 小程序端修改完成后：执行 `npm run build:mp-weixin`
- 云函数修改完成后：在微信开发者工具中右键云函数文件夹 → "上传并部署"
- 确保每次修改后的代码都能正常编译通过后再报告完成

