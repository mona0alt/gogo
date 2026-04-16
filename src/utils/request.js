// 请求基础地址 - 开发环境替换为实际 API 地址
const BASE_URL = 'https://api.bar-platform.com'

// 创建请求实例
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            // token 过期，跳转登录
            uni.removeStorageSync('token')
            uni.navigateTo({ url: '/pages/login/index' })
            reject(new Error(res.data.message || '未授权'))
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(new Error(res.data.message || '请求失败'))
          }
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          reject(new Error('登录已过期'))
        } else {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET 请求
export const get = (url, data) => request({ url, method: 'GET', data })

// POST 请求
export const post = (url, data) => request({ url, method: 'POST', data })

// PUT 请求
export const put = (url, data) => request({ url, method: 'PUT', data })

// DELETE 请求
export const del = (url, data) => request({ url, method: 'DELETE', data })

export default request
