import { callCloudFunction } from '../utils/request'

// 获取酒吧列表
export const getBarList = (params) => callCloudFunction('getBarList', params)

// 获取酒吧详情
export const getBarDetail = (id) => callCloudFunction('getBarDetail', { id })

// 获取附近酒吧
export const getNearbyBars = (location) => callCloudFunction('getNearbyBars', location)