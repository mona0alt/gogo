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
    const res = await db.collection('orders').doc(orderId).get()
    if (!res.data) return notFound('订单')

    if (res.data.userId !== user._id) {
      return fail('无权限查看该订单')
    }

    return success({
      id: res.data._id,
      orderNo: res.data.orderNo,
      barId: res.data.barId,
      barName: res.data.barName,
      status: res.data.status,
      items: res.data.items,
      totalAmount: res.data.totalAmount,
      createdAt: res.data.createdAt.toISOString()
    })
  } catch (e) {
    return fail(e.message)
  }
}
