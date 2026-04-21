const { createHandler, success, fail } = require('../utils')

const schema = {
  barId: { required: true, type: 'string' },
  barName: { required: true, type: 'string' },
  items: { required: true, type: 'array' },
  totalAmount: { required: true, type: 'number' },
  userCouponId: { required: false, type: 'string' }
}

exports.main = createHandler({ schema }, async (event, context, { db, user, openid }) => {
  const { barId, barName, items, totalAmount, idempotencyKey, userCouponId } = event
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

  // 优惠券校验与核销
  let discountAmount = 0
  let couponName = ''

  if (userCouponId) {
    const ucRes = await db.collection('user_coupons').doc(userCouponId).get()
    if (!ucRes.data || ucRes.data.openid !== openid || ucRes.data.status !== 'unused') {
      return fail('优惠券无效或已使用')
    }
    const uc = ucRes.data
    const now = new Date()
    if (uc.expireAt && new Date(uc.expireAt) < now) {
      return fail('优惠券已过期')
    }

    const couponRes = await db.collection('coupons').doc(uc.couponId).get()
    if (!couponRes.data) {
      return fail('优惠券不存在')
    }
    const coupon = couponRes.data

    if (totalAmount < (coupon.threshold || 0)) {
      return fail('订单金额未达到优惠券使用门槛')
    }
    if (coupon.scopeType === 'bar' && coupon.scopeTarget && coupon.scopeTarget !== barId) {
      return fail('优惠券不适用于该酒吧')
    }

    if (coupon.type === 'fixed' || coupon.type === 'threshold') {
      discountAmount = coupon.value
    } else if (coupon.type === 'discount') {
      discountAmount = Math.round(totalAmount * (1 - coupon.value) * 100) / 100
    }
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount
    }
    couponName = coupon.name
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
    discountAmount,
    payAmount: Math.round((totalAmount - discountAmount) * 100) / 100,
    couponName,
    idempotencyKey: idempotencyKey || null,
    status: 'pending_payment',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const res = await db.collection('orders').add({ data: order })

  // 核销优惠券
  if (userCouponId) {
    await db.collection('user_coupons').doc(userCouponId).update({
      data: {
        status: 'used',
        usedAt: new Date(),
        orderId: res._id
      }
    })
  }

  // 清空购物车
  await db.collection('cart_items')
    .where({ userId, barId, status: 'active' })
    .update({ data: { status: 'inactive' } })

  return success({ orderId: res._id, orderNo })
})
