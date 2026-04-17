/**
 * 微信云开发请求工具
 * 使用 wx.cloud.callFunction 调用云函数
 */

/**
 * 调用云函数
 * @param {string} name 云函数名称
 * @param {object} data 传递参数
 */
export const callCloudFunction = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.errMsg && res.errMsg.includes('ok')) {
          resolve(res.result)
        } else {
          console.error('Cloud function error:', res)
          reject(new Error(res.errMsg || '云函数调用失败'))
        }
      },
      fail: (err) => {
        console.error('Cloud function fail:', err)
        wx.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default callCloudFunction