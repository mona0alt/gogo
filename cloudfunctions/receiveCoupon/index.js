const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    couponId: { required: true, type: 'string' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { couponId } = event

  // 检查优惠券模板是否存在且有效
  const couponRes = await db.collection('coupons').doc(couponId).get()
  if (!couponRes.data) {
    return fail('优惠券不存在')
  }
  const coupon = couponRes.data
  if (coupon.status !== 'active') {
    return fail('优惠券已下架')
  }

  // 检查是否已领取
  const existRes = await db.collection('user_coupons').where({
    openid,
    couponId
  }).count()
  if (existRes.total > 0) {
    return fail('您已领取过该优惠券')
  }

  // 计算过期时间
  const now = new Date()
  const validDays = coupon.validDays || 7
  const expireAt = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000)

  // 写入用户优惠券记录
  const addRes = await db.collection('user_coupons').add({
    data: {
      openid,
      couponId,
      status: 'unused',
      receivedAt: now,
      expireAt,
      usedAt: null,
      orderId: null
    }
  })

  return success({ userCouponId: addRes._id })
})