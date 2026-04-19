const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { groupId } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!groupId) {
    return { error: 'groupId required' }
  }

  let group
  try {
    const groupRes = await db.collection('groups').doc(groupId).get()
    group = groupRes.data
  } catch (err) {
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return { error: '拼团不存在' }
    }
    throw err
  }

  if (!group) {
    return { error: '拼团不存在' }
  }

  // Get match info if paired
  let matchInfo = null
  if (group.status === 'paired' && group.matchedUserOpenid) {
    try {
      const matchRes = await db.collection('group_matches')
        .where({
          groupId,
          status: 'accepted'
        })
        .get()
      if (matchRes.data.length > 0) {
        const match = matchRes.data[0]
        const userRes = await db.collection('users')
          .where({
            openid: match.fromOpenid === openid ? match.toOpenid : match.fromOpenid
          })
          .get()
        const user = userRes.data[0] || {}
        matchInfo = {
          ...match,
          partnerInfo: {
            nickname: user.nickname || '匿名用户',
            avatar: user.avatar || '',
            age: user.age || 0,
            gender: user.gender || 0
          }
        }
      }
    } catch (err) {
      // group_matches 集合不存在时忽略
      if (!(err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST'))) {
        throw err
      }
    }
  }

  return {
    group,
    matchInfo,
    isCreator: group.creatorOpenid === openid,
    isPartner: group.matchedUserOpenid === openid
  }
}
