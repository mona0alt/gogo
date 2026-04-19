const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  const users = await db.collection('users').where({ openid }).get()
  if (users.data.length === 0) {
    return { error: '用户不存在' }
  }

  const user = users.data[0]

  return {
    id: user._id,
    nickname: user.nickname || '',
    avatar: user.avatar || '',
    phone: user.phone || '',
    age: user.age || 0,
    gender: user.gender || 0,
    height: user.height || 0,
    weight: user.weight || 0,
    zodiac: user.zodiac || '',
    bio: user.bio || '',
    photos: user.photos || [],
    profileCompleted: user.profileCompleted || false
  }
}
