const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { orderId } = event
  const db = cloud.database()
  const _ = db.command

  if (!orderId) {
    return { success: false, error: '缺少订单ID' }
  }

  try {
    // 模拟支付成功，直接更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'pending_use',
        payTime: new Date(),
        updatedAt: new Date()
      }
    })

    return { success: true, message: '支付成功' }
  } catch (e) {
    console.error('Pay order failed:', e)
    return { success: false, error: e.message || '支付失败' }
  }
}
