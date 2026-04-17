const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { code, userId } = event
  const db = cloud.database()

  // 更新用户手机号
  if (userId) {
    await db.collection('users').doc(userId).update({
      data: {
        updatedAt: new Date()
      }
    })
  }

  return { success: true }
}
