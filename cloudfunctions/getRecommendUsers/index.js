const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { groupId, limit = 10 } = event
  const db = cloud.database()
  const _ = db.command
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  // Get the group info to know target gender
  const groupRes = await db.collection('groups').doc(groupId).get()
  const group = groupRes.data
  if (!group) {
    return { error: '拼团不存在' }
  }

  // Get already sent match requests for this group
  const sentRes = await db.collection('group_matches')
    .where({
      groupId,
      fromOpenid: openid
    })
    .get()
  const sentOpenids = sentRes.data.map(m => m.toOpenid)

  // Build query: opposite gender, profile completed, not self, not already sent
  const where = {
    openid: _.nin([openid, ...sentOpenids]),
    profileCompleted: true
  }

  if (group.targetGender) {
    const tg = Number(group.targetGender)
    where.gender = tg
  }

  const users = await db.collection('users')
    .where(where)
    .limit(limit)
    .get()

  // Collect all cloud:// fileIDs for batch conversion
  const fileIdSet = new Set()
  users.data.forEach(u => {
    if (u.avatar && u.avatar.startsWith('cloud://')) {
      fileIdSet.add(u.avatar)
    }
    if (u.photos && Array.isArray(u.photos)) {
      u.photos.forEach(p => {
        if (p && p.startsWith('cloud://')) {
          fileIdSet.add(p)
        }
      })
    }
  })

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

  const resolveUrl = (fileId) => {
    if (!fileId) return ''
    if (fileId.startsWith('cloud://')) {
      return urlMap[fileId] || ''
    }
    return fileId
  }

  const list = users.data.map(u => ({
    openid: u.openid,
    nickname: u.nickname || '匿名用户',
    avatar: resolveUrl(u.avatar),
    age: u.age || 0,
    gender: u.gender || 0,
    height: u.height || 0,
    weight: u.weight || 0,
    zodiac: u.zodiac || '',
    bio: u.bio || '',
    interests: u.interests || '',
    photos: (u.photos || []).map(resolveUrl)
  }))

  return { list }
}
