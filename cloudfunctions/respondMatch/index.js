const { init, success, fail, unauthorized, notFound, validate } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  const validationError = validate(event, {
    matchId: { required: true, type: 'string' },
    action: { required: true, type: 'string', enum: ['accept', 'reject'] }
  })
  if (validationError) {
    return fail(validationError)
  }

  const { matchId, action } = event

  try {
    const matchRes = await db.collection('group_matches').doc(matchId).get()
    const match = matchRes.data
    if (!match) {
      return notFound('配对请求')
    }

    if (match.toOpenid !== openid) {
      return fail('无权操作')
    }

    if (match.status !== 'pending') {
      return fail('该请求已处理')
    }

    const now = new Date()

    if (action === 'reject') {
      await db.collection('group_matches').doc(matchId).update({
        data: { status: 'rejected', updatedAt: now }
      })
      return success({ action: 'rejected' })
    }

    if (action === 'accept') {
      // Check if user already has a successful pair today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const existingPair = await db.collection('groups')
        .where({
          status: 'paired',
          matchedUserOpenid: openid,
          createdAt: db.command.gte(today)
        })
        .get()

      if (existingPair.data.length > 0) {
        return fail('您今天已有一个配对成功的订单')
      }

      // Update match status
      await db.collection('group_matches').doc(matchId).update({
        data: { status: 'accepted', updatedAt: now }
      })

      // Update group status to paired
      await db.collection('groups').doc(match.groupId).update({
        data: {
          status: 'paired',
          matchedUserOpenid: openid,
          updatedAt: now
        }
      })

      // Reject all other pending matches for this group
      const otherMatches = await db.collection('group_matches')
        .where({
          groupId: match.groupId,
          status: 'pending',
          _id: db.command.neq(matchId)
        })
        .get()

      for (const m of otherMatches.data) {
        await db.collection('group_matches').doc(m._id).update({
          data: { status: 'rejected', updatedAt: now }
        })
      }

      return success({ action: 'accepted', groupId: match.groupId })
    }

    return fail('无效操作')
  } catch (err) {
    console.error('respondMatch error:', err)
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return fail('系统数据未初始化，请联系管理员')
    }
    return fail(err.message || '处理配对请求失败')
  }
}
