<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/default-bar.png" mode="aspectFit" />
      <text class="app-name">酒吧聚合平台</text>
      <text class="welcome">欢迎使用酒吧聚合平台</text>
    </view>

    <view class="login-body">
      <!-- 第一步：获取昵称头像 -->
      <button
        v-if="isReady && step === 'profile'"
        class="login-btn"
        @click="onLoginClick"
      >
        微信一键登录
      </button>

      <!-- 第二步：获取手机号（昵称头像授权成功后显示） -->
      <button
        v-if="isReady && step === 'phone'"
        class="login-btn"
        open-type="getPhoneNumber"
        @getphonenumber="onGetPhoneNumber"
      >
        授权手机号
      </button>
    </view>

    <view class="login-footer">
      <text class="agreement">登录即表示同意</text>
      <text class="link" @tap="openAgreement">《用户协议》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const step = ref('profile') // 'profile' | 'phone'
const tempNickname = ref('')
const tempAvatar = ref('')
const isReady = ref(false)

onMounted(() => {
  console.log('Login page mounted')
  isReady.value = true
})

// 第一步：获取用户昵称头像
const onLoginClick = async () => {
  console.log('onLoginClick called')

  try {
    console.log('Calling uni.getUserProfile...')
    const profileRes = await new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
    console.log('uni.getUserProfile result:', profileRes)

    if (profileRes.errMsg === 'getUserProfile:ok') {
      tempNickname.value = profileRes.userInfo.nickName
      tempAvatar.value = profileRes.userInfo.avatarUrl
      console.log('Got profile, nickname:', tempNickname.value)
      // 隐藏用户信息，显示手机号授权按钮
      step.value = 'phone'
    } else {
      console.log('User profile failed:', profileRes.errMsg)
      uni.showToast({ title: '需要授权昵称头像才能继续', icon: 'none' })
    }
  } catch (err) {
    console.error('getUserProfile error:', err)
    uni.showToast({ title: '获取用户信息失败', icon: 'none' })
  }
}

// 第二步：获取手机号
const onGetPhoneNumber = async (e) => {
  console.log('onGetPhoneNumber called', e.detail)
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    console.log('Phone number not authorized')
    uni.showToast({ title: '需要授权手机号才能完整使用', icon: 'none' })
    return
  }

  const phoneCode = e.detail.code
  console.log('Phone code:', phoneCode)

  // 获取微信 login code
  uni.showLoading({ title: '登录中...' })
  console.log('Calling uni.login...')

  let loginRes
  try {
    loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })
    console.log('uni.login result:', loginRes)
  } catch (err) {
    console.error('uni.login error:', err)
    uni.hideLoading()
    uni.showToast({ title: '微信登录失败', icon: 'none' })
    return
  }

  uni.hideLoading()

  if (loginRes.errMsg !== 'login:ok') {
    console.log('Login failed:', loginRes.errMsg)
    uni.showToast({ title: '微信登录失败', icon: 'none' })
    return
  }

  try {
    console.log('Calling loginWithProfile...')
    // 调用登录云函数（包含昵称头像）
    const data = await userStore.loginWithProfile(loginRes.code, tempNickname.value, tempAvatar.value)
    console.log('loginWithProfile result:', data)

    // 绑定手机号
    if (data.userInfo?.id) {
      console.log('Binding phone...')
      await userStore.bindPhone(phoneCode)
    }

    // 登录成功，跳转首页
    console.log('Login success, redirecting...')
    uni.switchTab({ url: '/pages/index/index' })
  } catch (err) {
    console.error('Login failed:', err)
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  }
}

// 打开用户协议
const openAgreement = () => {
  uni.showToast({ title: '用户协议页面待创建', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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
  border-radius: 20rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.welcome {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

.login-body {
  padding: 0 60rpx 60rpx;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff6b6b 100%);
  border-radius: 48rpx;
  font-size: 32rpx;
  color: #ffffff;
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
  background: linear-gradient(135deg, #ff4d4f 0%, #ff6b6b 100%);
}

.login-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 60rpx;
}

.agreement {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
}

.link {
  font-size: 24rpx;
  color: #ff4d4f;
}
</style>
