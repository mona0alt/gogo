const { createHandler, success, fail, rateLimit } = require('../utils')

const schema = {
  targetOpenid: { required: true, type: 'string' }
}

exports.main = createHandler({ schema, requireUser: false }, async (event, context, { db, openid }) => {
  const { targetOpenid } = event

  // 限流：每个 openid 每分钟最多 20 次关注
  const allowed = await rateLimit(db, `follow_${openid}`, 20, 60)
  if (!allowed) {
    return fail('操作过于频繁，请稍后再试')
  }

  if (targetOpenid === openid) {
    return fail('不能关注自己')
  }

  // 检查是否已关注
  const existing = await db.collection('follows')
    .where({ followerOpenid: openid, followingOpenid: targetOpenid })
    .get()

  if (existing.data.length > 0) {
    return fail('已关注该用户')
  }

  await db.collection('follows').add({
    data: {
      followerOpenid: openid,
      followingOpenid: targetOpenid,
      createdAt: new Date()
    }
  })

  return success({})
})
