const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action, userId, barId, productId, quantity, price, productName, productImage, itemId } = event
  const db = cloud.database()

  if (action === 'add') {
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
    return { success: true }
  }

  if (action === 'get') {
    const res = await db.collection('cart_items')
      .where({ userId, status: 'active' })
      .get()

    return {
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
    }
  }

  if (action === 'update') {
    await db.collection('cart_items').doc(itemId).update({
      data: { quantity }
    })
    return { success: true }
  }

  if (action === 'remove') {
    await db.collection('cart_items').doc(itemId).remove()
    return { success: true }
  }

  if (action === 'clear') {
    await db.collection('cart_items')
      .where({ userId, barId })
      .update({ data: { status: 'inactive' } })
    return { success: true }
  }

  return { success: false }
}