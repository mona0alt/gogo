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

    // 注意：微信支付需要商户号配置，此处为占位实现
    // 实际使用时需要在微信支付商户平台配置云开发免密支付
    return success({
      message: '支付功能待配置',
      // 支付参数占位，实际需要调起微信支付
      timeStamp: '',
      nonceStr: '',
      package: '',
      paySign: ''
    })
  } catch (e) {
    return fail(e.message)
  }
}
