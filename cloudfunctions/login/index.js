const cloud = require('wx-server-sdk')
const { createHandler, success, fail, getCurrentUser, rateLimit } = require('../utils')

exports.main = createHandler({ requireUser: false }, async (event, context, { db, openid }) => {
  const { nickname, avatar } = event

  // 限流：每个 openid 每分钟最多 30 次登录
  const allowed = await rateLimit(db, `login_${openid}`, 30, 60)
  if (!allowed) {
    return fail('操作过于频繁，请稍后再试')
  }

  // 查询或创建用户
  let user = await getCurrentUser(db, openid)

  if (!user) {
    // 新用户创建
    const now = new Date()
    user = {
      openid,
      nickname: nickname || '',
      avatar: avatar || '',
      phone: '',
      profileCompleted: false,
      createdAt: now,
      updatedAt: now,
      bars: []
    }
    const { _id } = await db.collection('users').add({ data: user })
    user._id = _id
  } else {
    // 更新现有用户的昵称和头像
    if (nickname || avatar) {
      const updateData = { updatedAt: new Date() }
      if (nickname) updateData.nickname = nickname
      if (avatar && avatar !== user.avatar) {
        updateData.avatar = avatar
        // 删除旧头像，避免云存储堆积
        if (user.avatar && user.avatar.startsWith('cloud://')) {
          try {
            await cloud.deleteFile({ fileList: [user.avatar] })
          } catch {
            // 忽略旧头像删除失败
          }
        }
      }
      if (Object.keys(updateData).length > 1) {
        await db.collection('users').doc(user._id).update({ data: updateData })
        if (nickname) user.nickname = nickname
        if (avatar) user.avatar = avatar
      }
    }
  }

  return success({
    userInfo: {
      id: user._id,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      age: user.age || 0,
      gender: user.gender || 0,
      height: user.height || 0,
      weight: user.weight || 0,
      zodiac: user.zodiac || '',
      bio: user.bio || '',
      photos: user.photos || [],
      profileCompleted: user.profileCompleted || false
    }
  })
})
