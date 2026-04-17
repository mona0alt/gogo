const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { code } = event
  const db = cloud.database()

  // 微信登录获取 openid
  const res = await cloud.openapi.login.code2Session({ code })
  const { openid } = res

  // 查询或创建用户
  const users = await db.collection('users').where({ openid }).get()
  let user

  if (users.data.length === 0) {
    // 新用户创建
    const now = new Date()
    user = {
      openid,
      nickname: '',
      avatar: '',
      phone: '',
      createdAt: now,
      updatedAt: now,
      bars: []
    }
    const { _id } = await db.collection('users').add({ data: user })
    user._id = _id
  } else {
    user = users.data[0]
  }

  // 生成自定义登录 token
  const token = Buffer.from(JSON.stringify({ openid, timestamp: Date.now() })).toString('base64')

  return { token, userInfo: { id: user._id, nickname: user.nickname, avatar: user.avatar, phone: user.phone } }
}