const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { userId, page = 1, pageSize = 10 } = event
  const db = cloud.database()

  const totalRes = await db.collection('orders').where({ userId }).count()
  const listRes = await db.collection('orders')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  return {
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
  }
}