const { createHandler, success, fail, notFound } = require('../utils')

const schema = {
  groupId: { required: true, type: 'string' },
  toOpenid: { required: true, type: 'string' }
}

exports.main = createHandler({ schema, requireUser: false }, async (event, context, { db, openid, _ }) => {
  const { groupId, toOpenid } = event

  // 检查拼团是否存在且可配对
  const groupRes = await db.collection('groups').doc(groupId).get()
  const group = groupRes.data
  if (!group) {
    return notFound('拼团')
  }
  if (group.status !== 'matching') {
    return fail('该拼团已不再接受配对')
  }

  // 检查是否已发送过
  const existing = await db.collection('group_matches')
    .where({ groupId, fromOpenid: openid, toOpenid })
    .get()

  if (existing.data.length > 0) {
    return fail('已发送过配对请求')
  }

  // 检查每日限制
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dailySent = await db.collection('group_matches')
    .where({
      fromOpenid: openid,
      status: _.in(['pending', 'accepted']),
      createdAt: _.gte(today)
    })
    .count()

  if (dailySent.total >= 20) {
    return fail('今日配对请求已达上限')
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

  return success({ matchId: _id })
})
