const cloud = require('wx-server-sdk')
const { init, success, fail, unauthorized, notFound, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { avatar, nickname, age, gender, height, weight, zodiac, bio, photos } = event
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  try {
    const user = await getCurrentUser(db, openid)
    if (!user) {
      return notFound('用户')
    }

    const updateData = {
      updatedAt: new Date(),
      profileCompleted: true
    }

    if (avatar !== undefined && avatar !== user.avatar) {
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

    return success({
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
    })
  } catch (e) {
    return fail(e.message)
  }
}
