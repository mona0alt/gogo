import { callCloudFunction } from '../utils/request'

// 获取商品分类
export const getCategories = (barId) => callCloudFunction('getCategories', { barId })

// 获取商品列表
export const getProductList = (barId, params) => callCloudFunction('getProductList', { barId, ...params })

// 获取商品详情
export const getProductDetail = (id) => callCloudFunction('getProductDetail', { id })