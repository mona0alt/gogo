const { createHandler, success, fail } = require('../utils')

exports.main = createHandler({
  schema: {
    id: { required: false, type: 'string' },
    name: { required: true, type: 'string', min: 1, max: 20 },
    phone: { required: true, type: 'string', min: 1, max: 20 },
    province: { required: true, type: 'string', min: 1 },
    city: { required: true, type: 'string', min: 1 },
    district: { required: true, type: 'string', min: 1 },
    detail: { required: true, type: 'string', min: 1, max: 100 },
    isDefault: { required: false, type: 'boolean' }
  },
  requireAuth: true,
  requireUser: true
}, async (event, context, { db, openid, user, _ }) => {
  const { id, name, phone, province, city, district, detail, isDefault = false } = event

  // 手机号简单校验
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(phone)) {
    return fail('手机号格式不正确')
  }

  const now = new Date()
  const data = {
    name,
    phone,
    province,
    city,
    district,
    detail,
    isDefault,
    updatedAt: now
  }

  let addressId

  if (id) {
    // 更新：先校验归属
    const existRes = await db.collection('delivery_address').doc(id).get()
    if (!existRes.data || existRes.data.openid !== openid) {
      return fail('地址不存在或无权限')
    }
    await db.collection('delivery_address').doc(id).update({ data })
    addressId = id
  } else {
    // 新增
    const addRes = await db.collection('delivery_address').add({
      data: { ...data, openid, createdAt: now }
    })
    addressId = addRes._id
  }

  // 如果设为默认，取消其他地址的默认状态
  if (isDefault) {
    await db.collection('delivery_address').where({
      openid,
      _id: _.neq(addressId),
      isDefault: true
    }).update({
      data: { isDefault: false }
    })
  }

  return success({ addressId })
})