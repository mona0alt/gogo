const { createHandler, success } = require('../utils')

exports.main = createHandler({ schema: null, requireAuth: true, requireUser: true }, async (event, context, { db, openid, user, _ }) => {
  const { page = 1, pageSize = 20 } = event

  const totalRes = await db.collection('delivery_address').where({ openid }).count()
  const listRes = await db.collection('delivery_address')
    .where({ openid })
    .orderBy('isDefault', 'desc')
    .orderBy('updatedAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()

  const list = listRes.data.map(item => ({
    id: item._id,
    name: item.name,
    phone: item.phone,
    province: item.province,
    city: item.city,
    district: item.district,
    detail: item.detail,
    isDefault: item.isDefault || false,
  }))

  return success({ list, total: totalRes.total })
})