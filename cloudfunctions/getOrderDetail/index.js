const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { orderId } = event
  const db = cloud.database()

  const res = await db.collection('orders').doc(orderId).get()
  if (!res.data) return null

  return {
    id: res.data._id,
    orderNo: res.data.orderNo,
    barId: res.data.barId,
    barName: res.data.barName,
    status: res.data.status,
    items: res.data.items,
    totalAmount: res.data.totalAmount,
    createdAt: res.data.createdAt.toISOString()
  }
}