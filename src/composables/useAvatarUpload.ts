export function useAvatarUpload() {
  const uploadAvatar = async (filePath: string): Promise<string> => {
    const uploadRes = await new Promise<{ fileID: string }>((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: `user-avatars/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`,
        filePath,
        success: resolve,
        fail: reject,
      })
    })
    return uploadRes.fileID
  }

  return { uploadAvatar }
}
