import { get, post } from '../utils/request'

// 获取订单列表
export const getOrderList = (params) => get('/api/orders', params)

// 获取订单详情
export const getOrderDetail = (id) => get(`/api/orders/${id}`)

// 创建订单
export const createOrder = (data) => post('/api/orders', data)

// 取消订单
export const cancelOrder = (id) => post(`/api/orders/${id}/cancel`)

// 发起支付
export const payOrder = (id) => post(`/api/orders/${id}/pay`)

// 获取支付参数（微信小程序）
export const getWxPayParams = (id) => get(`/api/orders/${id}/pay-params`)
