const { init, success, fail, unauthorized, notFound, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { code } = event
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  try {
    const user = await getCurrentUser(db, openid)
    if (!user) {
      return notFound('用户')
    }

    // 更新用户手机号（实际应调用微信接口解密 code 获取手机号）
    await db.collection('users').doc(user._id).update({
      data: {
        updatedAt: new Date()
      }
    })

    return success()
  } catch (e) {
    return fail(e.message)
  }
}
