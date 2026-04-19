const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { groupId, toOpenid } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  if (!groupId || !toOpenid) {
    return { error: '参数缺失' }
  }

  // Check if group exists and is still matching
  const groupRes = await db.collection('groups').doc(groupId).get()
  const group = groupRes.data
  if (!group) {
    return { error: '拼团不存在' }
  }
  if (group.status !== 'matching') {
    return { error: '该拼团已不再接受配对' }
  }

  // Check if already sent to this user
  const existing = await db.collection('group_matches')
    .where({ groupId, fromOpenid: openid, toOpenid })
    .get()

  if (existing.data.length > 0) {
    return { error: '已发送过配对请求' }
  }

  // Check daily limit: count pending + accepted matches from this user today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dailySent = await db.collection('group_matches')
    .where({
      fromOpenid: openid,
      status: db.command.in(['pending', 'accepted']),
      createdAt: db.command.gte(today)
    })
    .count()

  // Allow sending to up to 20 people per day
  if (dailySent.total >= 20) {
    return { error: '今日配对请求已达上限' }
  }

  const now = new Date()
  const match = {
    groupId,
    fromOpenid: openid,
    toOpenid,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }

  const { _id } = await db.collection('group_matches').add({ data: match })

  return {
    matchId: _id,
    success: true
  }
}
