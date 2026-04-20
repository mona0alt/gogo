const { init, success, fail } = require('../utils')

exports.main = async (event, context) => {
  const { db } = init()
  const { page = 1, pageSize = 10, category = '' } = event
  const limit = Math.min(Number(pageSize) || 10, 100)

  try {
    let query = db.collection('bars').where({ status: 'open' })
    if (category) {
      query = query.where({ category })
    }

    const totalRes = await query.count()
    const listRes = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .orderBy('rating', 'desc')
      .get()

    return success({
      list: listRes.data.map(bar => ({
        id: bar._id,
        name: bar.name,
        coverImage: bar.coverImage,
        category: bar.category,
        categoryName: bar.categoryName,
        address: bar.address,
        rating: bar.rating,
        status: bar.status,
        distance: bar.distance || '',
        price: bar.price || 0,
        tags: bar.tags || []
      })),
      total: totalRes.total
    })
  } catch (e) {
    return fail(e.message)
  }
}
