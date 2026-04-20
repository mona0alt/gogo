const { createHandler, success, fail } = require('../utils')

const schema = {
  barId: { required: true, type: 'string' },
  barName: { required: true, type: 'string' },
  packageType: { required: true, type: 'string' },
  date: { required: true, type: 'string' },
  startTime: { required: true, type: 'string' },
  endTime: { required: true, type: 'string' }
}

exports.main = createHandler({ schema, requireUser: false }, async (event, context, { db, openid, _ }) => {
  const { targetGender, barId, barName, packageType, date, startTime, endTime } = event

  // 检查是否已有进行中的拼团
  const activeGroups = await db.collection('groups')
    .where({
      creatorOpenid: openid,
      status: _.in(['matching', 'paired'])
    })
    .get()

  if (activeGroups.data.length > 0) {
    return fail('您已有一个进行中的拼团，请先处理')
  }

  const now = new Date()
  const group = {
    creatorOpenid: openid,
    targetGender: Number(targetGender) || 0,
    barId,
    barName,
    packageType,
    date,
    startTime,
    endTime,
    status: 'matching',
    matchedUserOpenid: '',
    createdAt: now,
    updatedAt: now
  }

  const { _id } = await db.collection('groups').add({ data: group })

  return success({ groupId: _id, group: { ...group, _id } })
})
