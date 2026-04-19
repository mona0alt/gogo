const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 测试用户数据（用于配对页面测试）
const mockUsers = [
  {
    openid: 'mock_user_001',
    nickname: '小雨',
    avatar: 'cloud://cloud1-d3gjrsyla8bdd9f4a.636c-cloud1-d3gjrsyla8bdd9f4a-1257768256/user-avatars/bar_style_female_1_compressed.jpg',
    age: 23,
    gender: 2,
    height: 165,
    weight: 48,
    zodiac: '射手座',
    bio: '喜欢唱歌、旅游、探店，性格开朗活泼，寻找志同道合的朋友一起玩~',
    interests: '音乐与旅行',
    photos: [],
    profileCompleted: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  },
  {
    openid: 'mock_user_002',
    nickname: 'Mia',
    avatar: 'cloud://cloud1-d3gjrsyla8bdd9f4a.636c-cloud1-d3gjrsyla8bdd9f4a-1257768256/user-avatars/bar_style_female_2_compressed.jpg',
    age: 25,
    gender: 2,
    height: 170,
    weight: 52,
    zodiac: '天称座',
    bio: '心理专业本硕毕业，收入算高薪吧。性格比较冷静成熟，属于大家说的姐姐型吧。',
    interests: '爵士与艺术',
    photos: [],
    profileCompleted: true,
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-02')
  },
  {
    openid: 'mock_user_003',
    nickname: '梦梦',
    avatar: 'cloud://cloud1-d3gjrsyla8bdd9f4a.636c-cloud1-d3gjrsyla8bdd9f4a-1257768256/user-avatars/bar_style_female_3_compressed.jpg',
    age: 22,
    gender: 2,
    height: 158,
    weight: 45,
    zodiac: '双鱼座',
    bio: '实习生，喜欢拍照和美食，每周末都想去探店！',
    interests: '摄影与美食',
    photos: [],
    profileCompleted: true,
    createdAt: new Date('2026-01-03'),
    updatedAt: new Date('2026-01-03')
  },
  {
    openid: 'mock_user_004',
    nickname: 'Elena',
    avatar: 'cloud://cloud1-d3gjrsyla8bdd9f4a.636c-cloud1-d3gjrsyla8bdd9f4a-1257768256/user-avatars/bar_style_female_4_compressed.jpg',
    age: 26,
    gender: 2,
    height: 168,
    weight: 50,
    zodiac: '金牛座',
    bio: '外企市场经理，工作忙碌但也喜欢下班后的微醤时光。',
    interests: '红酒与电影',
    photos: [],
    profileCompleted: true,
    createdAt: new Date('2026-01-04'),
    updatedAt: new Date('2026-01-04')
  },
  {
    openid: 'mock_user_005',
    nickname: '小北',
    avatar: 'cloud://cloud1-d3gjrsyla8bdd9f4a.636c-cloud1-d3gjrsyla8bdd9f4a-1257768256/user-avatars/bar_style_male_1_compressed.jpg',
    age: 24,
    gender: 1,
    height: 180,
    weight: 72,
    zodiac: '巨蟹座',
    bio: '程序员，喜欢打篮球和喝精酿，每周五晚必去酒吧放松！',
    interests: '篮球与精酿',
    photos: [],
    profileCompleted: true,
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-05')
  },
  {
    openid: 'mock_user_006',
    nickname: 'Alex',
    avatar: 'cloud://cloud1-d3gjrsyla8bdd9f4a.636c-cloud1-d3gjrsyla8bdd9f4a-1257768256/user-avatars/bar_style_male_2_compressed.jpg',
    age: 27,
    gender: 1,
    height: 178,
    weight: 70,
    zodiac: '天蠇座',
    bio: '音乐制作人，热爱电子音乐和夜生活，寻找同好一起玩！',
    interests: 'EDM与派对',
    photos: [],
    profileCompleted: true,
    createdAt: new Date('2026-01-06'),
    updatedAt: new Date('2026-01-06')
  }
]

// 酒吧数据
const bars = [
  { name: '深夜酒馆', category: '1', categoryName: '精酿啤酒', address: '朝阳区三里屯路19号', rating: 4.8, status: 'open', distance: '1.2km', price: 68, tags: ['精酿', '夜生活'], description: '酒吧环境优雅，音乐氛围好', openingHours: '18:00-02:00', minimumSpend: 50 },
  { name: '威士忌吧', category: '3', categoryName: '威士忌', address: '海淀区中关村大街', rating: 4.6, status: 'open', distance: '2.5km', price: 88, tags: ['单一麦芽', '专业'], description: '专业的威士忌酒吧', openingHours: '19:00-02:00', minimumSpend: 80 },
  { name: '鸡尾酒廊', category: '2', categoryName: '鸡尾酒', address: '朝阳区工人体育场北路', rating: 4.9, status: 'open', distance: '3.1km', price: 78, tags: ['创意', '精致'], description: '创意鸡尾酒专营', openingHours: '20:00-03:00', minimumSpend: 60 },
  { name: '爵士清吧', category: '5', categoryName: '清吧', address: '东城区鼓楼东大街', rating: 4.5, status: 'closed', distance: '4.0km', price: 58, tags: ['爵士', '安静'], description: '安静的爵士乐清吧', openingHours: '19:00-01:00', minimumSpend: 40 },
  { name: '精酿合作社', category: '1', categoryName: '精酿啤酒', address: '朝阳区望京SOHO', rating: 4.7, status: 'open', distance: '5.2km', price: 55, tags: ['社交', '精酿'], description: '年轻人聚集的精酿啤酒吧', openingHours: '17:00-02:00', minimumSpend: 50 }
]

// 分类模板
const categoriesTemplate = [
  { name: '啤酒', order: 1 },
  { name: '洋酒', order: 2 },
  { name: '鸡尾酒', order: 3 },
  { name: '软饮', order: 4 }
]

// 商品模板
const productsTemplate = [
  { name: '青岛啤酒', price: 15, categoryIndex: 0, sales: 100, stock: 50 },
  { name: '百威啤酒', price: 18, categoryIndex: 0, sales: 80, stock: 30 },
  { name: 'IPA精酿', price: 35, categoryIndex: 0, sales: 60, stock: 20 },
  { name: '黑啤', price: 28, categoryIndex: 0, sales: 45, stock: 15 },
  { name: '威士忌(杯)', price: 68, categoryIndex: 1, sales: 50, stock: 10 },
  { name: '伏特加', price: 48, categoryIndex: 1, sales: 40, stock: 12 },
  { name: '莫吉托', price: 38, categoryIndex: 2, sales: 70, stock: 25 },
  { name: '马天尼', price: 42, categoryIndex: 2, sales: 55, stock: 18 },
  { name: '可乐', price: 10, categoryIndex: 3, sales: 90, stock: 100 },
  { name: '雪碧', price: 10, categoryIndex: 3, sales: 85, stock: 100 }
]

// 确保集合存在（微信云开发：向不存在的集合 add 会自动创建集合）
async function ensureCollection(name) {
  try {
    const res = await db.collection(name).add({ data: { _temp: true, createdAt: new Date() } })
    await db.collection(name).doc(res._id).remove()
    return { created: true }
  } catch (e) {
    return { created: false, error: e.message }
  }
}

exports.main = async (event, context) => {
  const { action } = event

  if (action === 'ensureCollections') {
    const results = await Promise.all([
      ensureCollection('groups'),
      ensureCollection('group_matches'),
      ensureCollection('follows')
    ])
    return {
      success: true,
      message: '集合检查完成',
      results: { groups: results[0], group_matches: results[1], follows: results[2] }
    }
  }

  if (action === 'init') {
    // 清空现有数据
    try {
      await Promise.all([
        db.collection('bars').where({}).remove(),
        db.collection('categories').where({}).remove(),
        db.collection('products').where({}).remove(),
        db.collection('orders').where({}).remove(),
        db.collection('cart_items').where({}).remove(),
        db.collection('groups').where({}).remove(),
        db.collection('group_matches').where({}).remove(),
        db.collection('follows').where({}).remove()
      ])
    } catch (e) {
      // 忽略错误
    }

    try {
      // 1. 批量创建酒吧
      const barResults = await db.collection('bars').add({ data: bars })
      // 微信云开发 add 返回的是单个 _id，需要手动构建 ID 数组
      // 实际上返回的是 { _id: 'xxx' }，不是数组，需要查询获取
      const barsQuery = await db.collection('bars').get()
      const barIds = barsQuery.data.map(b => b._id)

      // 2. 为每个酒吧创建分类 (批量)
      const categoriesData = []
      for (let i = 0; i < barIds.length; i++) {
        for (const cat of categoriesTemplate) {
          categoriesData.push({
            name: cat.name,
            barId: barIds[i],
            status: 'active',
            order: cat.order
          })
        }
      }
      // 批量插入分类
      for (let i = 0; i < categoriesData.length; i += 10) {
        const batch = categoriesData.slice(i, i + 10)
        await db.collection('categories').add({ data: batch })
      }

      // 3. 获取所有分类 ID
      const categoriesQuery = await db.collection('categories').get()
      const categoryIds = categoriesQuery.data.map(c => c._id)

      // 4. 为每个酒吧创建商品 (批量)
      const productsData = []
      for (let i = 0; i < barIds.length; i++) {
        for (const prod of productsTemplate) {
          productsData.push({
            name: prod.name,
            price: prod.price,
            categoryId: categoryIds[i * 4 + prod.categoryIndex],
            barId: barIds[i],
            image: '',
            sales: prod.sales,
            stock: prod.stock,
            status: 'active'
          })
        }
      }
      // 批量插入商品
      for (let i = 0; i < productsData.length; i += 10) {
        const batch = productsData.slice(i, i + 10)
        await db.collection('products').add({ data: batch })
      }

      // 5. 创建测试订单
      await db.collection('orders').add({
        data: {
          orderNo: 'ORD_TEST_' + Date.now(),
          userId: 'test_user',
          barId: barIds[0],
          barName: bars[0].name,
          items: [{ productId: 'p1', productName: '青岛啤酒', price: 15, quantity: 2, productImage: '' }],
          totalAmount: 30,
          status: 'pending_payment',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return { success: true, message: '数据库初始化完成', barCount: barIds.length }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  if (action === 'clear') {
    try {
      await Promise.all([
        db.collection('bars').where({}).remove(),
        db.collection('categories').where({}).remove(),
        db.collection('products').where({}).remove(),
        db.collection('orders').where({}).remove(),
        db.collection('cart_items').where({}).remove(),
        db.collection('groups').where({}).remove(),
        db.collection('group_matches').where({}).remove(),
        db.collection('follows').where({}).remove()
      ])
      return { success: true, message: '数据库已清空' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  if (action === 'status') {
    try {
      const [barsRes, categoriesRes, productsRes, ordersRes, groupsRes, groupMatchesRes, followsRes, usersRes] = await Promise.all([
        db.collection('bars').count(),
        db.collection('categories').count(),
        db.collection('products').count(),
        db.collection('orders').count(),
        db.collection('groups').count(),
        db.collection('group_matches').count(),
        db.collection('follows').count(),
        db.collection('users').count()
      ])
      return {
        success: true,
        status: 'ready',
        counts: {
          bars: barsRes.total,
          categories: categoriesRes.total,
          products: productsRes.total,
          orders: ordersRes.total,
          groups: groupsRes.total,
          groupMatches: groupMatchesRes.total,
          follows: followsRes.total,
          users: usersRes.total
        }
      }
    } catch (err) {
      return { success: false, status: 'not_ready', error: err.message }
    }
  }

  if (action === 'mockUsers') {
    try {
      // 先清空已有 mock 用户
      const existing = await db.collection('users').where({
        openid: db.command.in(mockUsers.map(u => u.openid))
      }).get()
      for (const user of existing.data) {
        await db.collection('users').doc(user._id).remove()
      }

      // 插入 mock 用户
      for (const user of mockUsers) {
        await db.collection('users').add({ data: user })
      }

      return {
        success: true,
        message: `已插入 ${mockUsers.length} 条测试用户数据`,
        inserted: mockUsers.length
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { success: false, message: '未知操作' }
}