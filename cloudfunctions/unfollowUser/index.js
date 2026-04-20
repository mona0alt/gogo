const { init, success, fail, unauthorized, validate } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  const validationError = validate(event, {
    targetOpenid: { required: true, type: 'string' }
  })
  if (validationError) {
    return fail(validationError)
  }

  const { targetOpenid } = event

  try {
    const follow = await db.collection('follows')
      .where({ followerOpenid: openid, followingOpenid: targetOpenid })
      .get()

    if (follow.data.length === 0) {
      return fail('未关注该用户')
    }

    await db.collection('follows').doc(follow.data[0]._id).remove()

    return success({})
  } catch (err) {
    console.error('unfollowUser error:', err)
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return fail('系统数据未初始化，请联系管理员')
    }
    return fail(err.message || '取消关注失败')
  }
}
