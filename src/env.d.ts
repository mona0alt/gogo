/// <reference types="@dcloudio/types" />

interface WxCloudCallFunctionResult {
  errMsg?: string
  result?: any
}

interface WxCloudUploadResult {
  fileID: string
  statusCode: number
  errMsg?: string
}

interface WxCloud {
  callFunction(options: {
    name: string
    data?: Record<string, any>
    success?: (res: WxCloudCallFunctionResult) => void
    fail?: (err: any) => void
  }): void
  uploadFile(options: {
    cloudPath: string
    filePath: string
    success?: (res: WxCloudUploadResult) => void
    fail?: (err: any) => void
  }): void
}

interface Wx {
  cloud: WxCloud
}

declare const wx: Wx

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}
