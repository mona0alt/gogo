const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    id: { required: true, type: 'string' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { id } = event

  const existRes = await db.collection('delivery_address').doc(id).get()
  if (!existRes.data || existRes.data.openid !== openid) {
    return fail('地址不存在或无权限')
  }

  await db.collection('delivery_address').doc(id).remove()

  return success({})
})