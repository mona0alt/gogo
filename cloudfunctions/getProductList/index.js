const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { barId, categoryId = '', page = 1, pageSize = 20 } = event
  const db = cloud.database()

  let query = db.collection('products').where({ barId, status: 'active' })
  if (categoryId) {
    query = query.where({ categoryId })
  }

  const totalRes = await query.count()
  const listRes = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('sales', 'desc')
    .get()

  return {
    list: listRes.data.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price,
      categoryId: p.categoryId,
      barId: p.barId,
      image: p.image || '',
      sales: p.sales || 0,
      stock: p.stock || 0
    })),
    total: totalRes.total
  }
}