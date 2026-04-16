import { get } from '../utils/request'

// 获取商品分类
export const getCategories = (barId) => get(`/api/bars/${barId}/categories`)

// 获取商品列表
export const getProductList = (barId, params) => get(`/api/bars/${barId}/products`, params)

// 获取商品详情
export const getProductDetail = (id) => get(`/api/products/${id}`)
