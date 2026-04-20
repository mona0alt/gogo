const { init, success, fail } = require('../utils')

exports.main = async (event, context) => {
  const { db } = init()
  const { barId } = event

  try {
    const res = await db.collection('categories')
      .where({ barId, status: 'active' })
      .orderBy('order', 'asc')
      .get()

    return success({
      list: res.data.map(cat => ({
        id: cat._id,
        name: cat.name,
        barId: cat.barId
      })),
      total: res.data.length
    })
  } catch (e) {
    return fail(e.message)
  }
}
