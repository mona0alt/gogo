const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { targetOpenid } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  if (!targetOpenid || targetOpenid === openid) {
    return { error: '无效目标用户' }
  }

  try {
    // Check if already following
    const existing = await db.collection('follows')
      .where({ followerOpenid: openid, followingOpenid: targetOpenid })
      .get()

    if (existing.data.length > 0) {
      return { error: '已关注该用户' }
    }

    await db.collection('follows').add({
      data: {
        followerOpenid: openid,
        followingOpenid: targetOpenid,
        createdAt: new Date()
      }
    })

    return { success: true }
  } catch (err) {
    console.error('followUser error:', err)
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return { error: '系统数据未初始化，请联系管理员' }
    }
    return { error: err.message || '关注失败' }
  }
}
