const cloud = require('wx-server-sdk')
const { init, success, fail, unauthorized } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  const { page = 1, pageSize = 20 } = event
  const limit = Math.min(Number(pageSize) || 20, 100)

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
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    follows = listRes.data
  } catch (err) {
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return success({ list: [], total: 0, page, pageSize: limit })
    }
    return fail(err.message)
  }

  // Enrich with user info — batch query to avoid N+1
  const followingOpenids = [...new Set(follows.map(f => f.followingOpenid).filter(Boolean))]
  let userMap = {}
  if (followingOpenids.length > 0) {
    const userRes = await db.collection('users').where({ openid: db.command.in(followingOpenids) }).get()
    userRes.data.forEach(u => { userMap[u.openid] = u })
  }

  const list = []
  const fileIdSet = new Set()

  for (const f of follows) {
    const user = userMap[f.followingOpenid] || {}
    if (user.avatar && user.avatar.startsWith('cloud://')) {
      fileIdSet.add(user.avatar)
    }
    list.push({
      _id: f._id,
      openid: f.followingOpenid,
      createdAt: f.createdAt,
      rawAvatar: user.avatar || '',
      userInfo: {
        nickname: user.nickname || '匿名用户',
        avatar: user.avatar || '',
        age: user.age || 0,
        gender: user.gender || 0,
        bio: user.bio || ''
      }
    })
  }

  // Batch convert cloud:// fileIDs to https URLs
  const fileIdList = Array.from(fileIdSet)
  let urlMap = {}
  if (fileIdList.length > 0) {
    try {
      const tempRes = await cloud.getTempFileURL({
        fileList: fileIdList
      })
      tempRes.fileList.forEach(item => {
        if (item.fileID && item.tempFileURL) {
          urlMap[item.fileID] = item.tempFileURL
        }
      })
    } catch (e) {
      console.error('getTempFileURL error:', e)
    }
  }

  // Replace avatars with https URLs
  list.forEach(item => {
    if (item.rawAvatar && item.rawAvatar.startsWith('cloud://')) {
      item.userInfo.avatar = urlMap[item.rawAvatar] || ''
    }
    delete item.rawAvatar
  })

  return success({
    list,
    total,
    page,
    pageSize: limit
  })
}
