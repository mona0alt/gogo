const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { targetGender, barId, barName, packageType, date, startTime, endTime } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { error: '无法获取用户信息' }
  }

  try {
    // Check if user already has an active group (matching or paired)
    const activeGroups = await db.collection('groups')
      .where({
        creatorOpenid: openid,
        status: db.command.in(['matching', 'paired'])
      })
      .get()

    if (activeGroups.data.length > 0) {
      return { error: '您已有一个进行中的拼团，请先处理' }
    }

    const now = new Date()
    const group = {
      creatorOpenid: openid,
      targetGender: Number(targetGender) || 0,
      barId,
      barName,
      packageType,
      date,
      startTime,
      endTime,
      status: 'matching',
      matchedUserOpenid: '',
      createdAt: now,
      updatedAt: now
    }

    const { _id } = await db.collection('groups').add({ data: group })

    return {
      groupId: _id,
      group: { ...group, _id }
    }
  } catch (err) {
    console.error('createGroup error:', err)
    if (err.message && err.message.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      return { error: '系统数据未初始化，请联系管理员' }
    }
    return { error: err.message || '创建拼团失败' }
  }
}
