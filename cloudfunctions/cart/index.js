const { init, success, fail, unauthorized, notFound, validate, getCurrentUser } = require('../utils')

exports.main = async (event, context) => {
  const { action, barId, productId, quantity, price, productName, productImage, itemId } = event
  const { db, openid } = init()

  if (!openid) return unauthorized()

  const user = await getCurrentUser(db, openid)
  if (!user) return notFound('用户')
  const userId = user._id

  try {
    if (action === 'add') {
      const err = validate(event, {
        barId: { required: true, type: 'string' },
        productId: { required: true, type: 'string' },
        quantity: { required: true, type: 'number' },
        price: { required: true, type: 'number' }
      })
      if (err) return fail(err)

      // 检查是否已有该商品
      const exist = await db.collection('cart_items')
        .where({ userId, barId, productId, status: 'active' })
        .get()

      if (exist.data.length > 0) {
        // 更新数量
        await db.collection('cart_items').doc(exist.data[0]._id).update({
          data: { quantity: exist.data[0].quantity + quantity }
        })
      } else {
        // 新增
        await db.collection('cart_items').add({
          data: {
            userId,
            barId,
            productId,
            quantity,
            price,
            productName,
            productImage,
            status: 'active',
            createdAt: new Date()
          }
        })
      }
      return success()
    }

    if (action === 'get') {
      const res = await db.collection('cart_items')
        .where({ userId, status: 'active' })
        .get()

      return success({
        list: res.data.map(item => ({
          id: item._id,
          productId: item.productId,
          barId: item.barId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          productImage: item.productImage
        })),
        total: res.data.length,
        barId: res.data.length > 0 ? res.data[0].barId : null
      })
    }

    if (action === 'update') {
      const err = validate(event, {
        itemId: { required: true, type: 'string' },
        quantity: { required: true, type: 'number' }
      })
      if (err) return fail(err)

      // 校验该 item 是否属于当前用户
      const itemRes = await db.collection('cart_items').doc(itemId).get()
      if (!itemRes.data || itemRes.data.userId !== userId) {
        return fail('无权限操作')
      }
      await db.collection('cart_items').doc(itemId).update({
        data: { quantity }
      })
      return success()
    }

    if (action === 'remove') {
      const err = validate(event, { itemId: { required: true, type: 'string' } })
      if (err) return fail(err)

      // 校验该 item 是否属于当前用户
      const itemRes = await db.collection('cart_items').doc(itemId).get()
      if (!itemRes.data || itemRes.data.userId !== userId) {
        return fail('无权限操作')
      }
      await db.collection('cart_items').doc(itemId).remove()
      return success()
    }

    if (action === 'clear') {
      const err = validate(event, { barId: { required: true, type: 'string' } })
      if (err) return fail(err)

      await db.collection('cart_items')
        .where({ userId, barId })
        .update({ data: { status: 'inactive' } })
      return success()
    }

    return fail('未知操作')
  } catch (e) {
    return fail(e.message)
  }
}
