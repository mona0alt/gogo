const { init, success, fail, unauthorized, notFound, validate } = require('../utils')

exports.main = async (event, context) => {
  const { db, openid } = init()

  if (!openid) {
    return unauthorized()
  }

  const validationError = validate(event, {
    groupId: { required: true, type: 'string' }
  })
  if (validationError) {
    return fail(validationError)
  }

  const { groupId } = event

  try {
    const groupRes = await db.collection('groups').doc(groupId).get()
    const group = groupRes.data

    if (!group) {
      return notFound('拼团')
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

    return success({
      group,
      matchInfo,
      isCreator: group.creatorOpenid === openid,
      isPartner: group.matchedUserOpenid === openid
    })
  } catch (err) {
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return notFound('拼团')
    }
    return fail(err.message)
  }
}
