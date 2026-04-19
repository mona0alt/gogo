const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20 } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  let total = 0
  let follows = []

  try {
    const countRes = await db.collection('follows')
      .where({ followerOpenid: openid })
      .count()
    total = countRes.total

    const listRes = await db.collection('follows')
      .where({ followerOpenid: openid })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    follows = listRes.data
  } catch (err) {
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return { list: [], total: 0, page, pageSize }
    }
    throw err
  }

  // Enrich with user info
  const list = []
  for (const f of follows) {
    const userRes = await db.collection('users').where({ openid: f.followingOpenid }).get()
    const user = userRes.data[0] || {}
    list.push({
      _id: f._id,
      openid: f.followingOpenid,
      createdAt: f.createdAt,
      userInfo: {
        nickname: user.nickname || '匿名用户',
        avatar: user.avatar || '',
        age: user.age || 0,
        gender: user.gender || 0,
        bio: user.bio || ''
      }
    })
  }

  return {
    list,
    total,
    page,
    pageSize
  }
}
