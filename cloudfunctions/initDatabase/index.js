const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 酒吧数据
const bars = [
  { name: '深夜酒馆', category: '1', categoryName: '精酿啤酒', address: '朝阳区三里屯路19号', rating: 4.8, status: 'open', distance: '1.2km', price: 68, tags: ['精酿', '夜生活'], description: '酒吧环境优雅，音乐氛围好', openingHours: '18:00-02:00', minimumSpend: 50 },
  { name: '威士忌吧', category: '3', categoryName: '威士忌', address: '海淀区中关村大街', rating: 4.6, status: 'open', distance: '2.5km', price: 88, tags: ['单一麦芽', '专业'], description: '专业的威士忌酒吧', openingHours: '19:00-02:00', minimumSpend: 80 },
  { name: '鸡尾酒廊', category: '2', categoryName: '鸡尾酒', address: '朝阳区工人体育场北路', rating: 4.9, status: 'open', distance: '3.1km', price: 78, tags: ['创意', '精致'], description: '创意鸡尾酒专营', openingHours: '20:00-03:00', minimumSpend: 60 },
  { name: '爵士清吧', category: '5', categoryName: '清吧', address: '东城区鼓楼东大街', rating: 4.5, status: 'closed', distance: '4.0km', price: 58, tags: ['爵士', '安静'], description: '安静的爵士乐清吧', openingHours: '19:00-01:00', minimumSpend: 40 },
  { name: '精酿合作社', category: '1', categoryName: '精酿啤酒', address: '朝阳区望京SOHO', rating: 4.7, status: 'open', distance: '5.2km', price: 55, tags: ['社交', '精酿'], description: '年轻人聚集的精酿啤酒吧', openingHours: '17:00-02:00', minimumSpend: 50 }
]

// 分类数据
const categories = [
  { name: '啤酒', barId: 'bar1', status: 'active', order: 1 },
  { name: '洋酒', barId: 'bar1', status: 'active', order: 2 },
  { name: '鸡尾酒', barId: 'bar1', status: 'active', order: 3 },
  { name: '软饮', barId: 'bar1', status: 'active', order: 4 }
]

// 商品数据
const products = [
  { name: '青岛啤酒', price: 15, categoryId: 'c1', barId: 'bar1', image: '', sales: 100, stock: 50, status: 'active' },
  { name: '百威啤酒', price: 18, categoryId: 'c1', barId: 'bar1', image: '', sales: 80, stock: 30, status: 'active' },
  { name: 'IPA精酿', price: 35, categoryId: 'c1', barId: 'bar1', image: '', sales: 60, stock: 20, status: 'active' },
  { name: '黑啤', price: 28, categoryId: 'c1', barId: 'bar1', image: '', sales: 45, stock: 15, status: 'active' },
  { name: '威士忌(杯)', price: 68, categoryId: 'c2', barId: 'bar1', image: '', sales: 50, stock: 10, status: 'active' },
  { name: '伏特加', price: 48, categoryId: 'c2', barId: 'bar1', image: '', sales: 40, stock: 12, status: 'active' },
  { name: '莫吉托', price: 38, categoryId: 'c3', barId: 'bar1', image: '', sales: 70, stock: 25, status: 'active' },
  { name: '马天尼', price: 42, categoryId: 'c3', barId: 'bar1', image: '', sales: 55, stock: 18, status: 'active' },
  { name: '可乐', price: 10, categoryId: 'c4', barId: 'bar1', image: '', sales: 90, stock: 100, status: 'active' },
  { name: '雪碧', price: 10, categoryId: 'c4', barId: 'bar1', image: '', sales: 85, stock: 100, status: 'active' }
]

exports.main = async (event, context) => {
  const { action } = event

  if (action === 'init') {
    // 初始化集合并插入数据
    try {
      // 创建酒吧数据
      for (const bar of bars) {
        await db.collection('bars').add({ data: bar })
      }

      // 创建分类数据
      for (const cat of categories) {
        await db.collection('categories').add({ data: cat })
      }

      // 创建商品数据
      for (const prod of products) {
        await db.collection('products').add({ data: prod })
      }

      // 创建空订单（用于测试）
      await db.collection('orders').add({
        data: {
          orderNo: 'ORD_TEST_' + Date.now(),
          userId: 'test_user',
          barId: 'bar1',
          barName: '深夜酒馆',
          items: [
            { productId: 'p1', productName: '青岛啤酒', price: 15, quantity: 2, productImage: '' }
          ],
          totalAmount: 30,
          status: 'pending_payment',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return { success: true, message: '数据库初始化完成' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  if (action === 'clear') {
    // 清空所有数据
    try {
      await db.collection('bars').remove()
      await db.collection('categories').remove()
      await db.collection('products').remove()
      await db.collection('orders').remove()
      await db.collection('cart_items').remove()
      return { success: true, message: '数据库已清空' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  if (action === 'status') {
    // 检查数据库状态
    try {
      const barsCount = await db.collection('bars').count()
      const categoriesCount = await db.collection('categories').count()
      const productsCount = await db.collection('products').count()
      const ordersCount = await db.collection('orders').count()

      return {
        success: true,
        status: 'ready',
        counts: {
          bars: barsCount.total,
          categories: categoriesCount.total,
          products: productsCount.total,
          orders: ordersCount.total
        }
      }
    } catch (err) {
      return { success: false, status: 'not_ready', error: err.message }
    }
  }

  return { success: false, message: '未知操作' }
}