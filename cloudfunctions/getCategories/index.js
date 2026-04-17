const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { barId } = event
  const db = cloud.database()

  const res = await db.collection('categories')
    .where({ barId, status: 'active' })
    .orderBy('order', 'asc')
    .get()

  return {
    list: res.data.map(cat => ({
      id: cat._id,
      name: cat.name,
      barId: cat.barId
    })),
    total: res.data.length
  }
}