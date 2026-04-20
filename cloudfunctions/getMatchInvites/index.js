const { init, success, fail, unauthorized } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  const { status, page = 1, pageSize = 20 } = event
  const limit = Math.min(Number(pageSize) || 20, 100)

  try {
    const where = { toOpenid: openid }
    if (status) where.status = status

    const total = await db.collection('group_matches').where(where).count()

    const list = await db.collection('group_matches')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    // Enrich with sender info and group info
    const enrichedList = []
    for (const match of list.data) {
      const [userRes, groupRes] = await Promise.all([
        db.collection('users').where({ openid: match.fromOpenid }).get(),
        db.collection('groups').doc(match.groupId).get()
      ])

      const user = userRes.data[0] || {}
      const group = groupRes.data || {}

      enrichedList.push({
        ...match,
        fromUser: {
          nickname: user.nickname || '匿名用户',
          avatar: user.avatar || '',
          age: user.age || 0,
          gender: user.gender || 0
        },
        group: {
          barName: group.barName || '',
          date: group.date || '',
          startTime: group.startTime || '',
          endTime: group.endTime || '',
          packageType: group.packageType || ''
        }
      })
    }

    return success({
      list: enrichedList,
      total: total.total,
      page,
      pageSize: limit
    })
  } catch (err) {
    console.error('getMatchInvites error:', err)
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return success({ list: [], total: 0, page, pageSize: limit })
    }
    return fail(err.message || '获取配对邀请失败')
  }
}
