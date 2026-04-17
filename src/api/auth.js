import { callCloudFunction } from '../utils/request'

// 微信登录 - 获取 openid 并创建/获取用户
export const wxLogin = (code) => callCloudFunction('login', { code })

// 绑定手机号
export const bindPhone = (code) => callCloudFunction('bindPhone', { code })

// 获取用户信息
export const getUserInfo = () => callCloudFunction('getUserInfo', {})