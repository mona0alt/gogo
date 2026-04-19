const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { matchId, action } = event // action: 'accept' or 'reject'
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  if (!matchId || !action) {
    return { error: '参数缺失' }
  }

  const matchRes = await db.collection('group_matches').doc(matchId).get()
  const match = matchRes.data
  if (!match) {
    return { error: '配对请求不存在' }
  }

  if (match.toOpenid !== openid) {
    return { error: '无权操作' }
  }

  if (match.status !== 'pending') {
    return { error: '该请求已处理' }
  }

  const now = new Date()

  if (action === 'reject') {
    await db.collection('group_matches').doc(matchId).update({
      data: { status: 'rejected', updatedAt: now }
    })
    return { success: true, action: 'rejected' }
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
      return { error: '您今天已有一个配对成功的订单' }
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

    return { success: true, action: 'accepted', groupId: match.groupId }
  }

  return { error: '无效操作' }
}
