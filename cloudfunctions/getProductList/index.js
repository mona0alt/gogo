const { init, success, fail } = require('../utils')

exports.main = async (event, context) => {
  const { db } = init()
  const { barId, categoryId = '', page = 1, pageSize = 20 } = event
  const limit = Math.min(Number(pageSize) || 20, 100)

  try {
    let query = db.collection('products').where({ barId, status: 'active' })
    if (categoryId) {
      query = query.where({ categoryId })
    }

    const totalRes = await query.count()
    const listRes = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .orderBy('sales', 'desc')
      .get()

    return success({
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
    })
  } catch (e) {
    return fail(e.message)
  }
}
