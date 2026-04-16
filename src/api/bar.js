import { get } from '../utils/request'

// 获取酒吧列表
export const getBarList = (params) => get('/api/bars', params)

// 获取酒吧详情
export const getBarDetail = (id) => get(`/api/bars/${id}`)

// 获取附近酒吧
export const getNearbyBars = (params) => get('/api/bars/nearby', params)
