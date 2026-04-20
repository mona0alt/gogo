import type { CloudResult } from '@/types/api'

export class CloudFunctionError extends Error {
  constructor(
    message: string,
    public readonly functionName: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'CloudFunctionError'
  }
}

export const callCloudFunction = async <T = any>(
  name: string,
  data: Record<string, unknown> = {}
): Promise<T> => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res.result as CloudResult<T>
        if (res.errMsg?.includes('ok')) {
          if (result && typeof result === 'object' && 'success' in result && !result.success) {
            reject(
              new CloudFunctionError(
                (result.error as string) || '云函数业务错误',
                name
              )
            )
          } else {
            resolve(result as T)
          }
        } else {
          reject(new CloudFunctionError(res.errMsg || '云函数调用失败', name))
        }
      },
      fail: (err) => {
        reject(new CloudFunctionError(err.errMsg || '网络请求失败', name, err))
      },
    })
  })
}

export default callCloudFunction
