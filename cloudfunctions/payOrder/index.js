const { init, success, fail, unauthorized, notFound, validate, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { orderId } = event
  const { db, openid } = init()

  if (!openid) return unauthorized()

  const err = validate(event, { orderId: { required: true, type: 'string' } })
  if (err) return fail(err)

  const user = await getCurrentUser(db, openid)
  if (!user) return notFound('用户')

  try {
    const orderRes = await db.collection('orders').doc(orderId).get()
    if (!orderRes.data) return notFound('订单')

    if (orderRes.data.userId !== user._id) {
      return fail('无权限操作该订单')
    }

    // 模拟支付成功，直接更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'pending_use',
        payTime: new Date(),
        updatedAt: new Date()
      }
    })

    return success({ message: '支付成功' })
  } catch (e) {
    console.error('Pay order failed:', e)
    return fail(e.message || '支付失败')
  }
}
