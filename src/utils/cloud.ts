export async function resolveCloudAvatar(url: string): Promise<string> {
  if (!url || !url.startsWith('cloud://')) return url

  // 微信小程序 image 组件原生支持 cloud:// 协议，
  // 内部会自动获取临时链接并在过期时刷新，
  // 比手动缓存临时链接更可靠，避免 403。
  return url
}
