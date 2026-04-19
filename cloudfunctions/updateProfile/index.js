const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { avatar, nickname, age, gender, height, weight, zodiac, bio, photos } = event
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
  const updateData = {
    updatedAt: new Date(),
    profileCompleted: true
  }

  if (avatar !== undefined) updateData.avatar = avatar
  if (nickname !== undefined) updateData.nickname = nickname
  if (age !== undefined) updateData.age = age
  if (gender !== undefined) updateData.gender = gender
  if (height !== undefined) updateData.height = height
  if (weight !== undefined) updateData.weight = weight
  if (zodiac !== undefined) updateData.zodiac = zodiac
  if (bio !== undefined) updateData.bio = bio
  if (photos !== undefined) updateData.photos = photos

  await db.collection('users').doc(user._id).update({ data: updateData })

  // Return updated user info
  const updatedUser = await db.collection('users').doc(user._id).get()
  const data = updatedUser.data

  return {
    userInfo: {
      id: data._id,
      nickname: data.nickname || '',
      avatar: data.avatar || '',
      phone: data.phone || '',
      age: data.age || 0,
      gender: data.gender || 0,
      height: data.height || 0,
      weight: data.weight || 0,
      zodiac: data.zodiac || '',
      bio: data.bio || '',
      photos: data.photos || [],
      profileCompleted: data.profileCompleted || false
    }
  }
}
