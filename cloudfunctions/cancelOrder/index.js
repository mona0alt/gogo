const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { orderId } = event
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()

  if (!orderId) {
    return { success: false, error: '缺少订单ID' }
  }

  try {
    const orderRes = await db.collection('orders').doc(orderId).get()
    const order = orderRes.data

    if (!order) {
      return { success: false, error: '订单不存在' }
    }

    const userRes = await db.collection('users').where({ openid: OPENID }).get()
    const user = userRes.data[0]
    if (!user || order.userId !== user._id) {
      return { success: false, error: '无权限操作该订单' }
    }

    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    return { success: true, message: '订单已取消' }
  } catch (e) {
    console.error('Cancel order failed:', e)
    return { success: false, error: e.message || '取消失败' }
  }
}
