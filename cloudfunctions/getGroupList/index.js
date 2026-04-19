const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { status, barId, page = 1, pageSize = 20 } = event
  const db = cloud.database()
  const _ = db.command
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

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
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    list = listRes.data
  } catch (err) {
    // 集合不存在时返回空列表
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return { list: [], total: 0, page, pageSize }
    }
    throw err
  }

  // Enrich with creator info
  const enrichedList = []
  for (const group of list) {
    const userRes = await db.collection('users').where({ openid: group.creatorOpenid }).get()
    const user = userRes.data[0] || {}
    enrichedList.push({
      ...group,
      creatorInfo: {
        nickname: user.nickname || '匿名用户',
        avatar: user.avatar || '',
        age: user.age || 0,
        gender: user.gender || 0
      }
    })
  }

  return {
    list: enrichedList,
    total,
    page,
    pageSize
  }
}
