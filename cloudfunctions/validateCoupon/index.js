const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    userCouponId: { required: true, type: 'string' },
    orderAmount: { required: true, type: 'number', min: 0 },
    barId: { required: false, type: 'string' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { userCouponId, orderAmount, barId } = event

  // 查询用户优惠券记录
  const ucRes = await db.collection('user_coupons').doc(userCouponId).get()
  if (!ucRes.data) {
    return fail('优惠券不存在')
  }
  const uc = ucRes.data
  if (uc.openid !== openid) {
    return fail('优惠券不属于当前用户')
  }
  if (uc.status !== 'unused') {
    return fail('优惠券已使用或已过期')
  }

  const now = new Date()
  if (uc.expireAt && new Date(uc.expireAt) < now) {
    return fail('优惠券已过期')
  }

  // 查询优惠券模板
  const couponRes = await db.collection('coupons').doc(uc.couponId).get()
  if (!couponRes.data) {
    return fail('优惠券不存在')
  }
  const coupon = couponRes.data

  // 校验门槛
  const threshold = coupon.threshold || 0
  if (orderAmount < threshold) {
    return fail(`订单金额未满${threshold}元`)
  }

  // 校验范围
  if (coupon.scopeType === 'bar' && coupon.scopeTarget && coupon.scopeTarget !== barId) {
    return fail('优惠券不适用于该酒吧')
  }

  return success({ valid: true })
})