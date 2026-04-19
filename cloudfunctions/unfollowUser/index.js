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

  try {
    const follow = await db.collection('follows')
      .where({ followerOpenid: openid, followingOpenid: targetOpenid })
      .get()

    if (follow.data.length === 0) {
      return { error: '未关注该用户' }
    }

    await db.collection('follows').doc(follow.data[0]._id).remove()

    return { success: true }
  } catch (err) {
    console.error('unfollowUser error:', err)
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return { error: '系统数据未初始化，请联系管理员' }
    }
    return { error: err.message || '取消关注失败' }
  }
}
