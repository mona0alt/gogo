const { createHandler, success } = require('../utils')

exports.main = createHandler({ schema: null, requireAuth: true, requireUser: true }, async (event, context, { db, openid, user, _ }) => {
  const { status, page = 1, pageSize = 20 } = event
  const now = new Date()

  // 先更新已过期的 unused 记录
  await db.collection('user_coupons').where({
    openid,
    status: 'unused',
    expireAt: _.lt(now)
  }).update({
    data: { status: 'expired' }
  })

  // 构建查询条件
  const where = { openid }
  if (status) {
    where.status = status
  }

  // 分页查询
  const totalRes = await db.collection('user_coupons').where(where).count()
  const listRes = await db.collection('user_coupons')
    .where(where)
    .orderBy('status', 'asc')
    .orderBy('expireAt', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  // 关联优惠券模板信息
  const couponIds = listRes.data.map(item => item.couponId)
  let couponMap = {}
  if (couponIds.length > 0) {
    const couponRes = await db.collection('coupons').where({
      _id: _.in(couponIds)
    }).get()
    couponMap = Object.fromEntries(couponRes.data.map(c => [c._id, c]))
  }

  const list = listRes.data.map(item => {
    const coupon = couponMap[item.couponId] || {}
    return {
      id: item._id,
      couponId: item.couponId,
      name: coupon.name || '优惠券',
      type: coupon.type || 'fixed',
      value: coupon.value || 0,
      threshold: coupon.threshold || 0,
      scopeType: coupon.scopeType || 'all',
      scopeTarget: coupon.scopeTarget || '',
      status: item.status,
      expireAt: item.expireAt ? new Date(item.expireAt).toISOString() : '',
      usedAt: item.usedAt ? new Date(item.usedAt).toISOString() : undefined,
      orderId: item.orderId || undefined,
    }
  })

  return success({ list, total: totalRes.total })
})