const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { userId, barId, barName, items, totalAmount } = event
  const db = cloud.database()

  // 创建订单
  const order = {
    orderNo: 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
    userId,
    barId,
    barName,
    items: items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      productImage: item.productImage || ''
    })),
    totalAmount,
    status: 'pending_payment',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const res = await db.collection('orders').add({ data: order })

  // 清空购物车
  await db.collection('cart_items')
    .where({ userId, barId, status: 'active' })
    .update({ data: { status: 'inactive' } })

  return { success: true, orderId: res._id, orderNo: order.orderNo }
}