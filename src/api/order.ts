import { orderApi } from './index'

export const getOrderList = orderApi.getList
export const getOrderDetail = orderApi.getDetail
export const createOrder = orderApi.create
export const cancelOrder = orderApi.cancel
export const payOrder = orderApi.pay
export const getWxPayParams = orderApi.getPayParams
