const { init, success, fail, unauthorized, notFound, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10 } = event
  const limit = Math.min(Number(pageSize) || 10, 100)
  const { db, openid } = init()

  if (!openid) return unauthorized()

  const user = await getCurrentUser(db, openid)
  if (!user) return notFound('用户')
  const userId = user._id

  try {
    const totalRes = await db.collection('orders').where({ userId }).count()
    const listRes = await db.collection('orders')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    return success({
      list: listRes.data.map(order => ({
        id: order._id,
        orderNo: order.orderNo,
        barId: order.barId,
        barName: order.barName,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString()
      })),
      total: totalRes.total
    })
  } catch (e) {
    return fail(e.message)
  }
}
