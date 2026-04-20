const { init, success, fail, unauthorized, notFound, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  try {
    const user = await getCurrentUser(db, openid)
    if (!user) {
      return notFound('用户')
    }

    return success({
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
    })
  } catch (e) {
    return fail(e.message)
  }
}
