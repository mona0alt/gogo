// 微信登录获取 code
export const wxLogin = () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.errMsg === 'login:ok') {
          resolve(loginRes.code)
        } else {
          reject(new Error('微信登录失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 获取微信用户信息
export const getWxUserInfo = () => {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 获取手机号（需要用户主动点击按钮授权）
export const getPhoneNumber = (e) => {
  return new Promise((resolve, reject) => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      resolve(e.detail.code)
    } else {
      reject(new Error('获取手机号失败'))
    }
  })
}

// 检查登录状态
export const checkLogin = () => {
  const token = uni.getStorageSync('token')
  const userId = uni.getStorageSync('userId')
  return !!(token && userId)
}

// 退出登录
export const logout = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userId')
  uni.removeStorageSync('userInfo')
  uni.reLaunch({ url: '/pages/index/index' })
}