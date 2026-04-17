import { callCloudFunction } from '../utils/request'

// 微信登录 - 支持传入昵称头像
export const wxLogin = (code, nickname = '', avatar = '') =>
  callCloudFunction('login', { code, nickname, avatar })

// 绑定手机号
export const bindPhone = (code) => callCloudFunction('bindPhone', { code })

// 获取用户信息
export const getUserInfo = () => callCloudFunction('getUserInfo', {})