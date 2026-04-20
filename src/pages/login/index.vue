<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/default-bar.png" mode="aspectFit" />
      <text class="app-name">酒吧聚合平台</text>
      <text class="welcome">{{ hasChosenAvatar ? '完善您的资料' : '欢迎使用酒吧聚合平台' }}</text>
    </view>

    <view class="login-body">
      <!-- 未选头像：展示大头像选择按钮 -->
      <view v-if="!hasChosenAvatar" class="profile-card">
        <view class="card-header">
          <view class="section-dot"></view>
          <text class="section-title">选择头像</text>
        </view>

        <button class="avatar-choose-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image class="avatar-preview" src="/static/default-avatar.png" mode="aspectFill" />
          <view class="avatar-badge">
            <text class="icon-plus">+</text>
          </view>
        </button>
        <text class="avatar-tip">点击选择微信头像</text>
      </view>

      <!-- 已选头像：展示完整资料表单 -->
      <view v-else class="profile-card">
        <view class="card-header">
          <view class="section-dot"></view>
          <text class="section-title">完善资料</text>
        </view>

        <button class="avatar-choose-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image class="avatar-preview" :src="tempAvatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="avatar-badge">
            <text class="icon-edit">✎</text>
          </view>
        </button>
        <text class="avatar-tip">点击可更换头像</text>

        <view class="form-row" @tap="onNicknameRowTap">
          <text class="form-label">用户昵称</text>
          <input
            v-if="showNicknameInput"
            ref="nicknameInputRef"
            class="form-input"
            type="nickname"
            placeholder="请输入昵称"
            :focus="nicknameFocus"
            confirm-type="done"
            placeholder-class="placeholder"
            @focus="onNicknameFocus"
            @blur="onNicknameBlur"
            @input="onNicknameInput"
            @nicknamereview="onNicknameReview"
            @confirm="onConfirmLogin"
          />
          <text v-else class="form-input nickname-text">{{ tempNickname || '请输入昵称' }}</text>
        </view>

        <button class="submit-btn" @tap="onConfirmLogin">确认登录</button>
      </view>
    </view>

    <view class="login-footer">
      <text class="agreement">登录即表示同意</text>
      <text class="link" @tap="openAgreement">《用户协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { showToast, showModal, showLoading, hideLoading } from '@/utils/feedback'
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useAvatarUpload } from '@/composables/useAvatarUpload'

const userStore = useUserStore()
const { uploadAvatar } = useAvatarUpload()
const hasChosenAvatar = ref(false)
const tempNickname = ref('')
const tempAvatar = ref('')
const nicknameFocus = ref(false)
const showNicknameInput = ref(true)

// 老用户已有登录态时静默登录，避免重复选择头像
onLoad(() => {
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (storedUserInfo && storedUserInfo.nickname) {
    showLoading({ title: '登录中...', mask: true })
    // 10s 超时兜底，避免 loading 永久卡住
    const timeout = setTimeout(() => {
      hideLoading()
      // eslint-disable-next-line no-console
      console.warn('[login] silent login timeout')
    }, 10000)
    userStore.login()
      .then(() => uni.switchTab({ url: '/pages/index/index' }))
      .catch((err: any) => {
        console.error('Silent login failed:', err)
        hideLoading()
      })
      .finally(() => clearTimeout(timeout))
  }
})

const onChooseAvatar = (e: any) => {
  const avatarUrl = e.detail.avatarUrl || ''
  if (!avatarUrl) {
    showToast({ title: '请选择头像', icon: 'none' })
    return
  }
  tempAvatar.value = avatarUrl
  hasChosenAvatar.value = true
  // 选完头像后自动聚焦昵称输入框
  nextTick(() => {
    nicknameFocus.value = true
  })
}

const onNicknameFocus = () => {
  nicknameFocus.value = true
}

const onNicknameBlur = (e: any) => {
  const val = e.detail.value || ''
  tempNickname.value = val
  nicknameFocus.value = false
  if (val.trim()) {
    showNicknameInput.value = false
  }
  // eslint-disable-next-line no-console
  console.log('[login] onNicknameBlur', { val, showNicknameInput: showNicknameInput.value })
}

const onNicknameInput = (e: any) => {
  const val = e.detail.value || ''
  tempNickname.value = val
  if (val.trim()) {
    nicknameFocus.value = false
    // 输入有效昵称后销毁 input 以关闭微信原生昵称选择浮层
    showNicknameInput.value = false
  }
  // eslint-disable-next-line no-console
  console.log('[login] onNicknameInput', { val, showNicknameInput: showNicknameInput.value })
}

const onNicknameReview = (e: any) => {
  nicknameFocus.value = false
  const val = e.detail?.value || ''
  if (val.trim()) {
    tempNickname.value = val
  }
  if (e.detail?.pass) {
    showNicknameInput.value = false
  }
  // eslint-disable-next-line no-console
  console.log('[login] onNicknameReview', { detail: e.detail, val, showNicknameInput: showNicknameInput.value })
}

const onNicknameRowTap = () => {
  if (!showNicknameInput.value) {
    showNicknameInput.value = true
    nextTick(() => {
      nicknameFocus.value = true
    })
  }
}

const onConfirmLogin = async () => {
  // 强制关闭昵称输入框，确保微信原生昵称选择浮层消失
  nicknameFocus.value = false
  showNicknameInput.value = false
  uni.hideKeyboard()

  // 微信小程序 type="nickname" 的 input 值不会通过 @input/@blur 正常同步，
  // 必须用 selector query 在点击时直接读取当前值。
  const nicknameInput = await new Promise<string>((resolve) => {
    uni.createSelectorQuery()
      .in(getCurrentPages()[getCurrentPages().length - 1])
      .select('.form-input')
      .fields({ properties: ['value'] }, (res: any) => {
        resolve(res?.value || '')
      })
      .exec()
  })
  // 只在读到了有效值时才覆盖，避免 input 被销毁后读取到空 text 节点而清空已有昵称
  if (nicknameInput.trim()) {
    tempNickname.value = nicknameInput
  }

  // eslint-disable-next-line no-console
  console.log('[login] onConfirmLogin', { nickname: tempNickname.value, avatar: tempAvatar.value })

  if (!tempNickname.value.trim()) {
    await showModal({ title: '提示', content: '请输入昵称后点击键盘「完成」', showCancel: false, confirmText: '我知道了' })
    nicknameFocus.value = true
    return
  }

  showLoading({ title: '登录中...', mask: true })

  try {
    // 1. 获取微信 login code（在确认时调用，避免 code 过期）
    // eslint-disable-next-line no-console
    console.log('[login] calling uni.login...')
    const loginRes = await new Promise<any>((resolve: any, reject: any) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })
    // eslint-disable-next-line no-console
    console.log('[login] uni.login result', loginRes)

    if (!loginRes.code) {
      showToast({ title: loginRes.errMsg || '微信登录失败', icon: 'none' })
      return
    }

    // 2. 上传头像到云存储（失败时不阻断登录）
    let avatarFileID = ''
    if (tempAvatar.value) {
      try {
        // eslint-disable-next-line no-console
        console.log('[login] uploading avatar...')
        avatarFileID = await uploadAvatar(tempAvatar.value)
        // eslint-disable-next-line no-console
        console.log('[login] avatar uploaded', avatarFileID)
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.warn('[login] avatar upload failed:', e.message || e)
      }
    }

    // 3. 调用登录接口
    // eslint-disable-next-line no-console
    console.log('[login] calling login cloud function...')
    const loginData = await userStore.loginWithProfile(loginRes.code, tempNickname.value.trim(), avatarFileID)
    // eslint-disable-next-line no-console
    console.log('[login] cloud function success', loginData)

    // 4. 判断是否已完善资料
    if (loginData.userInfo && !loginData.userInfo.profileCompleted) {
      uni.navigateTo({ url: '/pages/profile-setup/index' })
    } else {
      uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[login] Login failed:', err)
    showToast({ title: err.message || '登录失败，请重试', icon: 'none', duration: 3000 })
  } finally {
    hideLoading()
  }
}

const openAgreement = () => {
  showToast({ title: '用户协议页面待创建', icon: 'none' })
}
</script>

<style lang="scss" scoped>

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-primary;
}

.login-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 120rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
  border-radius: 24rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.welcome {
  font-size: 28rpx;
  color: $text-secondary;
}

.login-body {
  padding: 0 30rpx 60rpx;
}

/* Profile Card */
.profile-card {
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 40rpx;
  align-self: flex-start;
}

.section-dot {
  width: 6rpx;
  height: 24rpx;
  background: $primary;
  border-radius: 3rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: bold;
  letter-spacing: 0.2em;
  color: $text-primary;
  text-transform: uppercase;
}

/* Avatar */
.avatar-choose-btn {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  overflow: visible;
}

.avatar-choose-btn::after {
  border: none;
}

.avatar-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 2rpx solid rgba($outline-variant, 0.3);
}

.avatar-badge {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 44rpx;
  height: 44rpx;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $bg-secondary;
}

.icon-plus {
  font-size: 28rpx;
  color: $on-primary;
  font-weight: 300;
  line-height: 1;
}

.icon-edit {
  font-size: 20rpx;
  color: $on-primary;
}

.avatar-tip {
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

/* Form */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 30rpx 0;
  border-bottom: 1rpx solid rgba($outline-variant, 0.1);
}

.form-label {
  font-size: 28rpx;
  color: $text-secondary;
  letter-spacing: 1rpx;
}

.form-input {
  font-size: 28rpx;
  color: $text-primary;
  background: transparent;
  border: none;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
}

.nickname-text {
  font-size: 28rpx;
  color: $text-primary;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
}

.placeholder {
  color: rgba($outline-variant, 0.5);
}

/* Submit Button */
.submit-btn {
  width: 100%;
  height: 96rpx;
  border-radius: $border-radius-full;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: 40rpx 0 0;
  background: $primary;
  color: $on-primary;
  box-shadow: 0 8rpx 40rpx rgba($primary, 0.3);
  transition: all 0.3s ease;
}

.submit-btn::after {
  border: none;
}

.submit-btn:active {
  transform: scale(0.97);
}

/* Footer */
.login-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 60rpx;
}

.agreement {
  font-size: 24rpx;
  color: $text-secondary;
}

.link {
  font-size: 24rpx;
  color: $primary;
}
</style>
