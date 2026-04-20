const { init, success, fail, notFound } = require('../utils')

exports.main = async (event, context) => {
  const { db } = init()
  const { id } = event

  try {
    const res = await db.collection('bars').doc(id).get()
    if (!res.data) {
      return notFound('酒吧')
    }

    return success({
      id: res.data._id,
      name: res.data.name,
      coverImage: res.data.coverImage,
      category: res.data.category,
      categoryName: res.data.categoryName,
      address: res.data.address,
      rating: res.data.rating,
      status: res.data.status,
      distance: res.data.distance || '',
      price: res.data.price || 0,
      tags: res.data.tags || [],
      description: res.data.description || '',
      openingHours: res.data.openingHours || '',
      minimumSpend: res.data.minimumSpend || 0
    })
  } catch (e) {
    return fail(e.message)
  }
}
