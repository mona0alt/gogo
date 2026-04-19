# E2E 测试用例集 - 酒吧聚合平台小程序

## 前置条件

1. 微信开发者工具已安装（Mac: `/Applications/wechatwebdevtools.app`）
2. 项目已构建：`npm run build:mp-weixin`
3. 自动化端口已开启（开发者工具 → 设置 → 安全 → 服务端口）
4. MCP 工具 `wechat-devtools-mcp` 已配置

## 启动步骤

```bash
# 1. 启动自动化端口
/Applications/wechatwebdevtools.app/Contents/MacOS/cli auto \
  --project $(pwd)/dist/build/mp-weixin \
  --auto-port 9420

# 2. 确认端口监听
lsof -i :9420 | grep LISTEN
```

---

## 用例组 1：登录页

### TC-LOGIN-01 验证页面标题
**前置**：首次进入小程序，当前页面为登录页
**步骤**：
1. 执行 `currentPage`，确认路径为 `pages/login/index`
2. 执行 `getElementText selector=".app-name"`
**预期结果**：返回"酒吧聚合平台"

### TC-LOGIN-02 验证欢迎语
**前置**：当前页面为登录页
**步骤**：
1. 执行 `getElementText selector=".welcome"`
**预期结果**：返回"欢迎使用酒吧聚合平台"

### TC-LOGIN-03 验证登录按钮
**前置**：当前页面为登录页
**步骤**：
1. 执行 `getElements selector=".login-btn"`
**预期结果**：返回 button 元素

---

## 用例组 2：首页

### TC-INDEX-01 验证搜索栏
**前置**：当前页面为首页
**步骤**：
1. 执行 `switchTab url="/pages/index/index"`
2. 执行 `getElementText selector=".placeholder"`
**预期结果**：返回"搜索酒吧名称"

### TC-INDEX-02 验证分类标签数量
**前置**：当前页面为首页
**步骤**：
1. 执行 `getElements selector=".category-item"`
**预期结果**：返回 6 个 view 元素（全部、精酿啤酒、鸡尾酒、威士忌、洋酒、清吧）

### TC-INDEX-03 验证酒吧列表加载
**前置**：当前页面为首页
**步骤**：
1. 执行 `getElements selector=".bar-card"`
**预期结果**：返回至少 1 个元素

### TC-INDEX-04 点击进入酒吧详情
**前置**：当前页面为首页，酒吧列表已加载
**步骤**：
1. 执行 `tapElement selector=".bar-card"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/bar-detail/index`，参数包含 `id`

---

## 用例组 3：酒吧详情页

### TC-BAR-01 验证酒吧名称
**前置**：已从首页进入酒吧详情页
**步骤**：
1. 执行 `getElementText selector=".name"`
**预期结果**：返回酒吧名称（如"鸡尾酒廊"）

### TC-BAR-02 验证营业状态
**前置**：当前页面为酒吧详情页
**步骤**：
1. 执行 `getElementText selector=".status--open"` 或查看 `.status` 类
**预期结果**：返回"营业中"或"休息中"

### TC-BAR-03 验证地址显示
**前置**：当前页面为酒吧详情页
**步骤**：
1. 执行 `getElementText selector=".text"`
**预期结果**：返回地址文本（如"朝阳区工人体育场北路"）

### TC-BAR-04 验证标签展示
**前置**：当前页面为酒吧详情页
**步骤**：
1. 执行 `getElements selector=".tag"`
**预期结果**：返回至少 1 个标签元素

### TC-BAR-05 验证底部操作按钮
**前置**：当前页面为酒吧详情页
**步骤**：
1. 执行 `getElementWxml selector=".actions"`
**预期结果**：包含"存酒"和"点单"两个按钮

### TC-BAR-06 点击点单进入点单页
**前置**：当前页面为酒吧详情页
**步骤**：
1. 执行 `tapElement selector=".btn--primary"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/order/index`

---

## 用例组 4：点单页

### TC-ORDER-01 验证酒吧标题
**前置**：已从酒吧详情页点击"点单"进入
**步骤**：
1. 执行 `getElementText selector=".name"`
**预期结果**：返回当前酒吧名称（如"鸡尾酒廊"）

### TC-ORDER-02 验证搜索框
**前置**：当前页面为点单页
**步骤**：
1. 执行 `getElementText selector=".placeholder"`
**预期结果**：返回"搜索商品"

### TC-ORDER-03 验证分类列表加载
**前置**：当前页面为点单页，已选择酒吧
**步骤**：
1. 执行 `getElements selector=".category-item"`
**预期结果**：返回至少 1 个分类（预期 4 个：啤酒、洋酒、鸡尾酒、软饮）

### TC-ORDER-04 验证默认选中第一个分类
**前置**：当前页面为点单页
**步骤**：
1. 执行 `getElementWxml selector=".category-item"`
**预期结果**：第一个分类元素带有 `active` 类

### TC-ORDER-05 验证商品列表加载
**前置**：当前页面为点单页，分类已加载
**步骤**：
1. 执行 `getElements selector=".product-card"`
**预期结果**：返回至少 1 个商品卡片

### TC-ORDER-06 验证商品卡片信息
**前置**：当前页面为点单页，商品已加载
**步骤**：
1. 执行 `getElementText selector=".name"`（第一个商品）
2. 执行 `getElementText selector=".price"`（第一个商品）
**预期结果**：返回商品名称和价格

### TC-ORDER-07 切换分类
**前置**：当前页面为点单页，多个分类已加载
**步骤**：
1. 执行 `getElements selector=".category-item"`，记录分类数量
2. 执行 `tapElement selector=".category-item:nth-child(3)"`（点击第三个分类）
3. 执行 `screenshot`
**预期结果**：右侧商品列表刷新，显示新分类下的商品

### TC-ORDER-08 加入购物车
**前置**：当前页面为点单页，商品已加载
**步骤**：
1. 执行 `tapElement selector=".add-btn"`（第一个商品的加购按钮）
2. 执行 `screenshot`
**预期结果**：底部出现购物车浮层，显示商品数量和金额

### TC-ORDER-09 连续加购多件商品
**前置**：当前页面为点单页
**步骤**：
1. 执行 `tapElement selector=".add-btn"`（点击不同商品的加购按钮 3 次）
2. 执行 `getElementText selector=".badge"`
**预期结果**：购物车徽章数量大于 1

---

## 用例组 5：商品搜索页

### TC-SEARCH-01 进入搜索页
**前置**：当前页面为点单页
**步骤**：
1. 执行 `tapElement selector=".search-input"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/product-search/index`

### TC-SEARCH-02 输入搜索关键词
**前置**：当前页面为搜索页
**步骤**：
1. 执行 `inputElement selector="input" value="鸡尾酒"`
2. 执行 `screenshot`
**预期结果**：搜索框显示"鸡尾酒"

### TC-SEARCH-03 取消返回
**前置**：当前页面为搜索页
**步骤**：
1. 执行 `tapElement selector=".cancel"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/order/index`

---

## 用例组 6：购物车页

### TC-CART-01 进入购物车
**前置**：点单页已有商品加入购物车
**步骤**：
1. 执行 `tapElement selector=".cart-float"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/cart/index`

### TC-CART-02 验证商品列表
**前置**：当前页面为购物车页，已有商品
**步骤**：
1. 执行 `getElements selector=".cart-item"`
**预期结果**：返回至少 1 个购物车项

### TC-CART-03 验证合计金额
**前置**：当前页面为购物车页
**步骤**：
1. 执行 `getElementText selector=".total .amount"`
**预期结果**：返回金额文本（如"¥86"）

### TC-CART-04 点击去结算
**前置**：当前页面为购物车页
**步骤**：
1. 执行 `tapElement selector=".btn--primary"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/checkout/index`

### TC-CART-05 空购物车状态
**前置**：购物车为空
**步骤**：
1. 执行 `navigateTo url="/pages/cart/index"`
2. 执行 `getElementText selector=".empty-text"`
**预期结果**：显示"购物车是空的"

---

## 用例组 7：结算页

### TC-CHECKOUT-01 验证酒吧信息
**前置**：从购物车页进入结算页
**步骤**：
1. 执行 `getElementText selector=".bar-info .name"`
**预期结果**：返回酒吧名称

### TC-CHECKOUT-02 验证商品清单
**前置**：当前页面为结算页
**步骤**：
1. 执行 `getElements selector=".item"`
**预期结果**：返回至少 1 个商品项

### TC-CHECKOUT-03 验证金额计算
**前置**：当前页面为结算页
**步骤**：
1. 执行 `getElementText selector=".amount-section .total .value"`
**预期结果**：返回实付金额

### TC-CHECKOUT-04 验证优惠券入口
**前置**：当前页面为结算页
**步骤**：
1. 执行 `getElementText selector=".coupon-section .placeholder"`
**预期结果**：返回"暂无可用"

### TC-CHECKOUT-05 验证提交订单按钮
**前置**：当前页面为结算页
**步骤**：
1. 执行 `getElementText selector=".btn--primary"`
**预期结果**：返回"提交订单"

---

## 用例组 8：订单列表页

### TC-ORDERS-01 验证状态标签
**前置**：当前页面为订单列表页
**步骤**：
1. 执行 `switchTab url="/pages/orders/index"`
2. 执行 `getElements selector=".tab"`
**预期结果**：返回 5 个标签（全部、待付款、待使用、已完成、已取消）

### TC-ORDERS-02 验证订单卡片
**前置**：当前页面为订单列表页，有历史订单
**步骤**：
1. 执行 `getElements selector=".order-card"`
**预期结果**：返回至少 1 个订单卡片

### TC-ORDERS-03 点击进入订单详情
**前置**：当前页面为订单列表页，有订单
**步骤**：
1. 执行 `tapElement selector=".order-card"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/order-detail/index`，参数包含 `id`

---

## 用例组 9：订单详情页

### TC-DETAIL-01 验证订单状态
**前置**：已从订单列表进入详情页
**步骤**：
1. 执行 `getElementText selector=".status-text"`
**预期结果**：返回订单状态（如"待付款"）

### TC-DETAIL-02 验证商品明细
**前置**：当前页面为订单详情页
**步骤**：
1. 执行 `getElements selector=".product-item"`
**预期结果**：返回至少 1 个商品项

### TC-DETAIL-03 验证订单编号
**前置**：当前页面为订单详情页
**步骤**：
1. 执行 `getElementText selector=".order-no"`
**预期结果**：返回订单编号文本

### TC-DETAIL-04 验证操作按钮
**前置**：当前页面为待付款订单详情
**步骤**：
1. 执行 `getElementText selector=".btn--secondary"`
2. 执行 `getElementText selector=".btn--primary"`
**预期结果**：分别返回"取消订单"和"去支付"

---

## 用例组 10：我的页

### TC-MINE-01 验证用户信息
**前置**：当前页面为我的页，用户已登录
**步骤**：
1. 执行 `switchTab url="/pages/mine/index"`
2. 执行 `getElementText selector=".nickname"`
**预期结果**：返回用户昵称

### TC-MINE-02 验证统计信息
**前置**：当前页面为我的页
**步骤**：
1. 执行 `getElements selector=".stat-item"`
**预期结果**：返回 3 个统计项（订单、存酒、余额）

### TC-MINE-03 验证菜单列表
**前置**：当前页面为我的页
**步骤**：
1. 执行 `getElements selector=".menu-item"`
**预期结果**：返回 5 个菜单项

### TC-MINE-04 点击我的订单
**前置**：当前页面为我的页
**步骤**：
1. 执行 `tapElement selector=".menu-item"`
2. 执行 `currentPage`
**预期结果**：路径为 `pages/orders/index`

---

## 端到端流程用例

### TC-E2E-01 完整购买流程
**目标**：验证从浏览到结算的完整链路
**步骤**：
1. `switchTab url="/pages/index/index"` — 进入首页
2. `tapElement selector=".bar-card"` — 点击第一个酒吧
3. 等待页面跳转，确认 `currentPage` 路径为 `pages/bar-detail/index`
4. `tapElement selector=".btn--primary"` — 点击"点单"
5. 等待页面跳转，确认 `currentPage` 路径为 `pages/order/index`
6. `getElements selector=".category-item"` — 验证分类已加载
7. `getElements selector=".product-card"` — 验证商品已加载
8. `tapElement selector=".category-item:nth-child(3)"` — 切换分类
9. `tapElement selector=".add-btn"` — 加入购物车（2-3 次）
10. `tapElement selector=".cart-float"` — 进入购物车
11. `tapElement selector=".btn--primary"` — 去结算
12. `currentPage` — 确认路径为 `pages/checkout/index`
13. `getElements selector=".item"` — 验证商品清单
14. `getElementText selector=".total .amount"` — 验证金额

**预期结果**：整个流程无报错，每个步骤页面跳转和数据加载正常

### TC-E2E-02 TabBar 切换流程
**目标**：验证四个 TabBar 页面正常切换
**步骤**：
1. `switchTab url="/pages/index/index"` — 首页
2. `switchTab url="/pages/order/index"` — 点单
3. `switchTab url="/pages/orders/index"` — 订单
4. `switchTab url="/pages/mine/index"` — 我的

**预期结果**：每个 TabBar 页面正常渲染，无报错

### TC-E2E-03 订单查看流程
**目标**：验证订单列表到详情的查看链路
**步骤**：
1. `switchTab url="/pages/orders/index"` — 进入订单列表
2. `getElements selector=".tab"` — 验证 5 个状态标签
3. `tapElement selector=".order-card"` — 点击第一个订单
4. `currentPage` — 确认跳转到订单详情
5. `getElementText selector=".status-text"` — 验证状态显示
6. `getElements selector=".product-item"` — 验证商品明细
7. `navigateBack delta=1` — 返回订单列表
8. `currentPage` — 确认路径为 `pages/orders/index`

**预期结果**：订单列表和详情正常显示，返回操作正常

---

## 数据验证用例（可选）

### TC-DATA-01 验证云函数返回数据
**步骤**：
执行 `evaluate`：
```js
() => {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'getBarList',
      data: { page: 1, pageSize: 5 },
      success: (res) => resolve({ success: true, count: res.result.list.length }),
      fail: (err) => resolve({ success: false, error: err })
    })
  })
}
```
**预期结果**：`success: true`，`count >= 1`

### TC-DATA-02 验证商品数据
**步骤**：
执行 `evaluate`：
```js
() => {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'getProductList',
      data: { barId: '3b28bab269e1aff10000d28b40ce9053', page: 1, pageSize: 20 },
      success: (res) => resolve({ success: true, count: res.result.list.length }),
      fail: (err) => resolve({ success: false })
    })
  })
}
```
**预期结果**：`success: true`，`count >= 1`

### TC-DATA-03 验证分类数据
**步骤**：
执行 `evaluate`：
```js
() => {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'getCategories',
      data: { barId: '3b28bab269e1aff10000d28b40ce9053' },
      success: (res) => resolve({ success: true, count: res.result.list.length }),
      fail: (err) => resolve({ success: false })
    })
  })
}
```
**预期结果**：`success: true`，`count >= 1`

---

## 错误检查用例

### TC-ERROR-01 检查控制台错误日志
**步骤**：
1. 执行 `getlogs limit=50 type=error`
**预期结果**：无 error 日志返回

### TC-ERROR-02 检查运行时异常
**步骤**：
1. 执行 `getexceptions limit=20`
**预期结果**：无异常返回

---

## 附录：截图检查清单

以下场景建议截图存档：

- [ ] 首页 - 酒吧列表
- [ ] 酒吧详情页 - 完整信息
- [ ] 点单页 - 分类和商品列表
- [ ] 点单页 - 切换分类后的商品
- [ ] 点单页 - 加入购物车后的浮层
- [ ] 购物车页 - 商品列表和合计
- [ ] 结算页 - 商品清单和金额
- [ ] 订单列表页 - 订单卡片
- [ ] 订单详情页 - 商品明细
- [ ] 我的页 - 用户信息和菜单
