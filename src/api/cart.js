import { callCloudFunction } from '../utils/request'

// 获取购物车列表
export const getCartList = () => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('cart', { action: 'get', userId })
}

// 添加到购物车
export const addToCart = (item) => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('cart', { action: 'add', userId, ...item })
}

// 更新购物车商品数量
export const updateCartItem = (itemId, { quantity }) => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('cart', { action: 'update', userId, itemId, quantity })
}

// 删除购物车商品
export const removeCartItem = (itemId) => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('cart', { action: 'remove', userId, itemId })
}

// 清空购物车
export const clearCart = () => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('cart', { action: 'clear', userId })
}