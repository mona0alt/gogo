const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10, category = '' } = event
  const db = cloud.database()

  let query = db.collection('bars').where({ status: 'open' })
  if (category) {
    query = query.where({ category })
  }

  const totalRes = await query.count()
  const listRes = await query
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('rating', 'desc')
    .get()

  return {
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
  }
}