const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { nickname, avatar } = event
  const db = cloud.database()

  // 获取 openid（通过云开发上下文获取，无需调用 code2Session）
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  // 查询或创建用户
  const users = await db.collection('users').where({ openid }).get()
  let user

  if (users.data.length === 0) {
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
    user = users.data[0]
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
          } catch (e) {
            console.log('Delete old avatar failed:', e)
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

  // 生成自定义登录 token
  const token = Buffer.from(JSON.stringify({ openid, timestamp: Date.now() })).toString('base64')

  return {
    token,
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
  }
}
