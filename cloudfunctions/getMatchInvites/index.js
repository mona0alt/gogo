const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { status, page = 1, pageSize = 20 } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  const where = { toOpenid: openid }
  if (status) where.status = status

  const total = await db.collection('group_matches').where(where).count()

  const list = await db.collection('group_matches')
    .where(where)
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
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

  return {
    list: enrichedList,
    total: total.total,
    page,
    pageSize
  }
}
