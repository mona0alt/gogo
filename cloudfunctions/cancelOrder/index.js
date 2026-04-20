const { init, success, fail, unauthorized, notFound, validate, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { orderId } = event
  const { db, openid } = init()

  if (!openid) return unauthorized()

  const err = validate(event, { orderId: { required: true, type: 'string' } })
  if (err) return fail(err)

  try {
    const orderRes = await db.collection('orders').doc(orderId).get()
    const order = orderRes.data

    if (!order) return notFound('订单')

    const user = await getCurrentUser(db, openid)
    if (!user || order.userId !== user._id) {
      return fail('无权限操作该订单')
    }

    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    })

    return success({ message: '订单已取消' })
  } catch (e) {
    console.error('Cancel order failed:', e)
    return fail(e.message || '取消失败')
  }
}
