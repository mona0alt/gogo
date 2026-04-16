// 请求基础地址 - 开发环境替换为实际 API 地址
const BASE_URL = 'https://api.bar-platform.com'

// Mock 数据开关 - 上线前改为 false
const USE_MOCK = true

// Mock 基础数据
const mockBars = [
  { id: '1', name: '深夜酒馆', coverImage: '', category: '1', categoryName: '精酿啤酒', address: '朝阳区三里屯路19号', rating: 4.8, status: 'open', distance: '1.2km', price: 68, tags: ['精酿', '夜生活'] },
  { id: '2', name: '威士忌吧', coverImage: '', category: '3', categoryName: '威士忌', address: '海淀区中关村大街', rating: 4.6, status: 'open', distance: '2.5km', price: 88, tags: ['单一麦芽', '专业'] },
  { id: '3', name: '鸡尾酒廊', coverImage: '', category: '2', categoryName: '鸡尾酒', address: '朝阳区工人体育场北路', rating: 4.9, status: 'open', distance: '3.1km', price: 78, tags: ['创意', '精致'] },
  { id: '4', name: '爵士清吧', coverImage: '', category: '5', categoryName: '清吧', address: '东城区鼓楼东大街', rating: 4.5, status: 'closed', distance: '4.0km', price: 58, tags: ['爵士', '安静'] },
  { id: '5', name: '精酿合作社', coverImage: '', category: '1', categoryName: '精酿啤酒', address: '朝阳区望京SOHO', rating: 4.7, status: 'open', distance: '5.2km', price: 55, tags: ['社交', '精酿'] }
]

const mockOrders = [
  { id: 'o1', barId: '1', barName: '深夜酒馆', status: 'pending_payment', items: [{ id: 'p1', name: '青岛啤酒', price: 15, quantity: 2, productImage: '' }], totalAmount: 30, createdAt: '2026-04-16 10:00' },
  { id: 'o2', barId: '2', barName: '威士忌吧', status: 'pending_use', items: [{ id: 'p2', name: 'Macallan 12年', price: 128, quantity: 1, productImage: '' }], totalAmount: 128, createdAt: '2026-04-15 22:00' },
  { id: 'o3', barId: '1', barName: '深夜酒馆', status: 'completed', items: [{ id: 'p1', name: '青岛啤酒', price: 15, quantity: 6, productImage: '' }], totalAmount: 90, createdAt: '2026-04-14 20:00' }
]

const mockProducts = [
  { id: 'p1', name: '青岛啤酒', price: 15, categoryId: 'c1', barId: '1', image: '', sales: 100, stock: 50 },
  { id: 'p2', name: '百威啤酒', price: 18, categoryId: 'c1', barId: '1', image: '', sales: 80, stock: 30 },
  { id: 'p3', name: 'IPA精酿', price: 35, categoryId: 'c1', barId: '1', image: '', sales: 60, stock: 20 },
  { id: 'p4', name: '黑啤', price: 28, categoryId: 'c1', barId: '1', image: '', sales: 45, stock: 15 },
  { id: 'p5', name: '威士忌(杯)', price: 68, categoryId: 'c2', barId: '1', image: '', sales: 50, stock: 10 },
  { id: 'p6', name: '伏特加', price: 48, categoryId: 'c2', barId: '1', image: '', sales: 40, stock: 12 },
  { id: 'p7', name: '莫吉托', price: 38, categoryId: 'c3', barId: '1', image: '', sales: 70, stock: 25 },
  { id: 'p8', name: '马天尼', price: 42, categoryId: 'c3', barId: '1', image: '', sales: 55, stock: 18 },
  { id: 'p9', name: '可乐', price: 10, categoryId: 'c4', barId: '1', image: '', sales: 90, stock: 100 },
  { id: 'p10', name: '雪碧', price: 10, categoryId: 'c4', barId: '1', image: '', sales: 85, stock: 100 }
]

const mockCategories = [
  { id: 'c1', name: '啤酒', barId: '1' },
  { id: 'c2', name: '洋酒', barId: '1' },
  { id: 'c3', name: '鸡尾酒', barId: '1' },
  { id: 'c4', name: '软饮', barId: '1' }
]

// 通用的 mock 响应（兜底）
const defaultMockResponse = { list: [], total: 0 }

// 获取 mock 数据
const getMockData = (url, method = 'GET') => {
  // 去掉 query string 进行匹配
  const urlPath = url.split('?')[0]
  const urlParts = urlPath.split('/')

  // /api/bars - 酒吧列表
  if (urlPath === '/api/bars' || urlPath === '/api/bars/nearby') {
    return { list: mockBars, total: mockBars.length }
  }

  // /api/bars/:id - 酒吧详情
  if (urlParts[1] === 'api' && urlParts[2] === 'bars' && urlParts[3] && !urlParts[4]) {
    const bar = mockBars.find(b => b.id === urlParts[3]) || mockBars[0]
    return {
      ...bar,
      description: '酒吧环境优雅，音乐氛围好',
      openingHours: '18:00-02:00',
      minimumSpend: 50
    }
  }

  // /api/bars/:id/categories - 分类
  if (urlParts[1] === 'api' && urlParts[2] === 'bars' && urlParts[3] && urlParts[4] === 'categories') {
    return { list: mockCategories, total: mockCategories.length }
  }

  // /api/bars/:id/products - 商品列表
  if (urlParts[1] === 'api' && urlParts[2] === 'bars' && urlParts[3] && urlParts[4] === 'products') {
    return { list: mockProducts, total: mockProducts.length }
  }

  // /api/orders - 订单列表
  if (urlPath === '/api/orders') {
    return { list: mockOrders, total: mockOrders.length }
  }

  // /api/orders/:id - 订单详情
  if (urlParts[1] === 'api' && urlParts[2] === 'orders' && urlParts[3] && !urlParts[4]) {
    const order = mockOrders.find(o => o.id === urlParts[3]) || mockOrders[0]
    return order
  }

  // /api/orders/:id/cancel - 取消订单
  if (urlParts[1] === 'api' && urlParts[2] === 'orders' && urlParts[3] && urlParts[4] === 'cancel') {
    return { success: true }
  }

  // /api/orders/:id/pay - 支付
  if (urlParts[1] === 'api' && urlParts[2] === 'orders' && urlParts[3] && urlParts[4] === 'pay') {
    return { success: true, orderId: urlParts[3] }
  }

  // /api/orders/:id/pay-params - 支付参数
  if (urlParts[1] === 'api' && urlParts[2] === 'orders' && urlParts[3] && urlParts[4] === 'pay-params') {
    return { timeStamp: '', nonceStr: '', package: '', paySign: '' }
  }

  // /api/cart - 购物车
  if (urlPath === '/api/cart') {
    if (method === 'POST') {
      return { success: true, cartId: 'cart_' + Date.now() }
    }
    return { list: [], total: 0, barId: null }
  }

  // /api/cart/:id - 更新购物车
  if (urlParts[1] === 'api' && urlParts[2] === 'cart' && urlParts[3]) {
    return { success: true }
  }

  // /api/auth/login - 登录
  if (urlPath === '/api/auth/login') {
    return { token: 'mock_token_' + Date.now(), userInfo: { id: 'u1', nickname: '酒吧爱好者', avatar: '', phone: '138****8888' } }
  }

  // /api/auth/userInfo - 用户信息
  if (urlPath === '/api/auth/userInfo') {
    return { id: 'u1', nickname: '酒吧爱好者', avatar: '', phone: '138****8888', balance: 1000, points: 500 }
  }

  // /api/products/:id - 商品详情
  if (urlParts[1] === 'api' && urlParts[2] === 'products' && urlParts[3]) {
    const product = mockProducts.find(p => p.id === urlParts[3]) || mockProducts[0]
    return product
  }

  // 默认返回空列表
  return defaultMockResponse
}

// 创建请求实例
const request = (options) => {
  return new Promise((resolve, reject) => {
    if (USE_MOCK) {
      const result = getMockData(options.url, options.method)
      resolve(JSON.parse(JSON.stringify(result)))
      return
    }

    const token = uni.getStorageSync('token')

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            uni.removeStorageSync('token')
            uni.navigateTo({ url: '/pages/login/index' })
            reject(new Error(res.data.message || '未授权'))
          } else {
            uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(new Error(res.data.message || '请求失败'))
          }
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          reject(new Error('登录已过期'))
        } else {
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// GET 请求
export const get = (url, data) => request({ url, method: 'GET', data })

// POST 请求
export const post = (url, data) => request({ url, method: 'POST', data })

// PUT 请求
export const put = (url, data) => request({ url, method: 'PUT', data })

// DELETE 请求
export const del = (url, data) => request({ url, method: 'DELETE', data })

export default request
