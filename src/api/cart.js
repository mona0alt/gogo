import { get, post, put, del } from '../utils/request'

// 获取购物车列表
export const getCartList = () => get('/api/cart')

// 添加到购物车
export const addToCart = (data) => post('/api/cart', data)

// 更新购物车商品数量
export const updateCartItem = (id, data) => put(`/api/cart/${id}`, data)

// 删除购物车商品
export const removeCartItem = (id) => del(`/api/cart/${id}`)

// 清空购物车
export const clearCart = () => del('/api/cart')
