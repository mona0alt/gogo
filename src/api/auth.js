import { post } from '../utils/request'

// 微信登录
export const wxLogin = (code) => post('/api/auth/login', { code })

// 绑定手机号
export const bindPhone = (code) => post('/api/auth/bindPhone', { code })

// 获取用户信息
export const getUserInfo = () => get('/api/auth/userInfo')
