import { cartApi } from './index'

export const getCartList = cartApi.getList
export const addToCart = cartApi.add
export const updateCartItem = cartApi.update
export const removeCartItem = cartApi.remove
export const clearCart = cartApi.clear
