const { createHandler, success, fail } = require('../utils')

const schema = {
  barId: { required: true, type: 'string' },
  barName: { required: true, type: 'string' },
  items: { required: true, type: 'array' },
  totalAmount: { required: true, type: 'number' }
}

exports.main = createHandler({ schema }, async (event, context, { db, user }) => {
  const { barId, barName, items, totalAmount, idempotencyKey } = event
  const userId = user._id

  // 幂等性检查
  if (idempotencyKey) {
    const existing = await db.collection('orders')
      .where({ idempotencyKey })
      .get()
    if (existing.data.length > 0) {
      const order = existing.data[0]
      return success({ orderId: order._id, orderNo: order.orderNo, duplicate: true })
    }
  }

  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const orderNo = `ORD${timestamp}${random}`

  const order = {
    orderNo,
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
    idempotencyKey: idempotencyKey || null,
    status: 'pending_payment',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const res = await db.collection('orders').add({ data: order })

  // 清空购物车
  await db.collection('cart_items')
    .where({ userId, barId, status: 'active' })
    .update({ data: { status: 'inactive' } })

  return success({ orderId: res._id, orderNo })
})
