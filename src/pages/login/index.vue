<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/default-bar.png" mode="aspectFit" />
      <text class="app-name">酒吧聚合平台</text>
      <text class="welcome">{{ step === 1 ? '欢迎使用酒吧聚合平台' : '完善您的资料' }}</text>
    </view>

    <view class="login-body">
      <!-- Step 1: 进入资料填写 -->
      <button v-if="step === 1" class="login-btn" @tap="onLoginClick">
        微信一键登录
      </button>

      <!-- Step 2: 选择头像和昵称后确认登录 -->
      <view v-if="step === 2" class="profile-form">
        <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <image class="avatar-preview" :src="tempAvatar || '/static/default-avatar.png'" mode="aspectFill" />
        </button>
        <text class="avatar-tip">点击头像选择</text>

        <input
          class="nickname-input"
          type="nickname"
          placeholder="请输入昵称"
          @blur="onNicknameBlur"
          @input="onNicknameInput"
        />

        <button class="login-btn" @tap="onConfirmLogin">确认登录</button>
      </view>
    </view>

    <view class="login-footer">
      <text class="agreement">登录即表示同意</text>
      <text class="link" @tap="openAgreement">《用户协议》</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const step = ref(1)
const tempNickname = ref('')
const tempAvatar = ref('')

const onLoginClick = () => {
  step.value = 2
}

const onChooseAvatar = (e) => {
  tempAvatar.value = e.detail.avatarUrl || ''
}

const onNicknameBlur = (e) => {
  tempNickname.value = e.detail.value || ''
}

const onNicknameInput = (e) => {
  tempNickname.value = e.detail.value || ''
}

const onConfirmLogin = async () => {
  if (!tempNickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...', mask: true })

  try {
    // 1. 获取微信 login code（在确认时调用，避免 code 过期）
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })

    if (loginRes.errMsg !== 'login:ok') {
      uni.showToast({ title: '微信登录失败', icon: 'none' })
      return
    }

    // 2. 上传头像到云存储
    let avatarFileID = ''
    if (tempAvatar.value) {
      const uploadRes = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: `user-avatars/${Date.now()}.jpg`,
          filePath: tempAvatar.value,
          success: resolve,
          fail: reject
        })
      })
      avatarFileID = uploadRes.fileID
    }

    // 3. 调用登录接口
    const loginData = await userStore.loginWithProfile(loginRes.code, tempNickname.value.trim(), avatarFileID)

    // 4. 判断是否已完善资料
    if (loginData.userInfo && !loginData.userInfo.profileCompleted) {
      uni.navigateTo({ url: '/pages/profile-setup/index' })
    } else {
      uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (err) {
    console.error('Login failed:', err)
    uni.showToast({ title: err.message || '登录失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const openAgreement = () => {
  uni.showToast({ title: '用户协议页面待创建', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, $bg-primary 0%, $bg-secondary 100%);
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
  padding: 0 60rpx 60rpx;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: 0;
}

.login-btn::after {
  border: none;
}

button.login-btn {
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  color: $on-primary;
  box-shadow: 0 8px 20px rgba($primary, 0.25);
}

.profile-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  background: transparent;
  border: 2px solid rgba($outline-variant, 0.4);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-btn::after {
  border: none;
}

.avatar-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.avatar-tip {
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

.nickname-input {
  width: 100%;
  height: 96rpx;
  background-color: $bg-dim;
  border-radius: 48rpx;
  padding: 0 40rpx;
  font-size: 32rpx;
  color: $text-primary;
  margin-bottom: 60rpx;
  box-sizing: border-box;
  border: none;
}

.nickname-input::placeholder {
  color: rgba($text-secondary, 0.6);
}

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
