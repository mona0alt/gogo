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
    where.gender = group.targetGender
  }

  const users = await db.collection('users')
    .where(where)
    .limit(limit)
    .get()

  const list = users.data.map(u => ({
    openid: u.openid,
    nickname: u.nickname || '匿名用户',
    avatar: u.avatar || '',
    age: u.age || 0,
    gender: u.gender || 0,
    height: u.height || 0,
    weight: u.weight || 0,
    zodiac: u.zodiac || '',
    bio: u.bio || '',
    photos: u.photos || []
  }))

  return { list }
}
