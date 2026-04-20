const { init, success, fail } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()
  const _ = db.command

  const { status, barId, page = 1, pageSize = 20 } = event
  const limit = Math.min(Number(pageSize) || 20, 100)

  const where = {}
  if (status) where.status = status
  if (barId) where.barId = barId

  // Exclude user's own groups from public list unless explicitly querying own groups
  if (event.excludeOwn !== false && openid) {
    where.creatorOpenid = _.neq(openid)
  }

  let total = 0
  let list = []

  try {
    const countRes = await db.collection('groups').where(where).count()
    total = countRes.total

    const listRes = await db.collection('groups')
      .where(where)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    list = listRes.data
  } catch (err) {
    // 集合不存在时返回空列表
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return success({ list: [], total: 0, page, pageSize: limit })
    }
    return fail(err.message)
  }

  // Enrich with creator info — batch query to avoid N+1
  const openids = [...new Set(list.map(g => g.creatorOpenid).filter(Boolean))]
  let userMap = {}
  if (openids.length > 0) {
    const userRes = await db.collection('users').where({ openid: _.in(openids) }).get()
    userRes.data.forEach(u => { userMap[u.openid] = u })
  }

  const enrichedList = list.map(group => {
    const user = userMap[group.creatorOpenid] || {}
    return {
      ...group,
      creatorInfo: {
        nickname: user.nickname || '匿名用户',
        avatar: user.avatar || '',
        age: user.age || 0,
        gender: user.gender || 0
      }
    }
  })

  return success({
    list: enrichedList,
    total,
    page,
    pageSize: limit
  })
}
