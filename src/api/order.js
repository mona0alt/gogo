import { callCloudFunction } from '../utils/request'

// 获取订单列表
export const getOrderList = (params) => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('getOrders', { userId, ...params })
}

// 获取订单详情
export const getOrderDetail = (orderId) => callCloudFunction('getOrderDetail', { orderId })

// 创建订单
export const createOrder = (data) => {
  const userId = uni.getStorageSync('userId')
  return callCloudFunction('createOrder', { userId, ...data })
}

// 取消订单
export const cancelOrder = (id) => callCloudFunction('cancelOrder', { orderId: id })

// 发起支付
export const payOrder = (id) => callCloudFunction('payOrder', { orderId: id })

// 获取支付参数（微信小程序）
export const getWxPayParams = (id) => callCloudFunction('getPayParams', { orderId: id })