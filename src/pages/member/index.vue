<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <view class="top-bar">
      <view class="top-bar-content">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">&#x2039;</text>
        </view>
      </view>
    </view>

    <view class="main-content">
      <!-- 1. 用户信息区 -->
      <view class="user-section">
        <view class="watermark">VIP</view>
        <image class="avatar" :src="userAvatar" mode="aspectFill" @error="userAvatar = '/static/default-avatar.png'" />
        <view class="user-info">
          <text class="nickname">{{ userNickname }}</text>
          <view class="member-badge" v-if="currentLevel">
            <text class="badge-text">{{ currentLevel === 'svip' ? 'SVIP' : 'VIP' }}</text>
          </view>
        </view>
      </view>

      <!-- 2. 权益图标 -->
      <view class="benefits-grid">
        <view class="benefit-item">
          <view class="benefit-icon gold-circle">
            <text class="icon-text">&#x2605;</text>
          </view>
          <text class="benefit-label">VIP每日特权+10</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon blue-circle">
            <text class="icon-text">&#x25C6;</text>
          </view>
          <text class="benefit-label">SVIP每日特权+30</text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon gray-circle">
            <text class="icon-text">&#x2714;</text>
          </view>
          <text class="benefit-label">会员专属标识</text>
        </view>
      </view>

      <!-- 3. 套餐卡片 -->
      <view class="plan-section">
        <!-- VIP 卡片 -->
        <view
          class="plan-card vip-card"
          :class="{ active: selectedPlan === 'vip' }"
          @tap="selectPlan('vip')"
        >
          <view v-if="selectedPlan === 'vip'" class="selected-indicator">&#x2714;</view>
          <view class="plan-watermark">VIP</view>
          <view class="plan-header">
            <text class="plan-tag">VIP</text>
          </view>
          <view class="plan-price">
            <text class="price-symbol">&#xFFE5;</text>
            <text class="price-num">99</text>
            <text class="price-unit">/月</text>
          </view>
        </view>

        <!-- SVIP 卡片 -->
        <view
          class="plan-card svip-card"
          :class="{ active: selectedPlan === 'svip' }"
          @tap="selectPlan('svip')"
        >
          <view v-if="selectedPlan === 'svip'" class="selected-indicator">&#x2714;</view>
          <view class="plan-watermark svip-watermark">SVIP</view>
          <view class="plan-header">
            <text class="plan-tag svip-tag">SVIP</text>
          </view>
          <view class="plan-price">
            <text class="price-symbol svip-price">&#xFFE5;</text>
            <text class="price-num svip-price">999</text>
            <text class="price-unit svip-unit">/月</text>
          </view>
        </view>
      </view>

      <!-- 4. 开通按钮 -->
      <view class="action-section">
        <button
          class="subscribe-btn"
          :loading="submitting"
          :disabled="submitting"
          @tap="handleSubscribe"
        >
          {{ currentLevel ? '立即续费' : '立即开通' }}
        </button>
      </view>

      <!-- 5. 运营 Banner -->
      <view class="banner-section">
        <view class="banner-container">
          <image
            class="banner-image"
            src="/static/default-bar.png"
            mode="aspectFill"
          />
          <view class="banner-overlay">
            <text class="banner-text">限时特惠活动</text>
          </view>
        </view>
        <view class="banner-dots">
          <view class="dot active"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>

      <!-- 6. 权益说明 -->
      <view class="terms-section">
        <text class="terms-title">开通权益说明</text>
        <view class="terms-content">
          <text class="terms-text">1. 本会员服务为数字虚拟产品，开通成功后不支持退款。请在支付前仔细核对开通账号、套餐内容及支付金额。</text>
          <text class="terms-text">2. 会员权益说明：VIP会员可每日额外获得10次特权使用机会；SVIP会员可获得30次特权使用机会。会员专属标识将在个人资料页、列表页等显著位置展示。</text>
          <text class="terms-text">3. 续费规则：本产品不支持自动续费，会员到期后相关权益将自动失效，您可随时通过本页面进行手动续费。若您在会员有效期内续费，有效期将在当前剩余时长基础上顺延。</text>
          <text class="terms-text">4. 法律条款：使用本服务即视为您已同意并接受《会员服务协议》及《隐私保护政策》。我们保留在法律允许范围内对会员权益及价格进行调整的权利。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const userAvatar = ref('/static/default-avatar.png')
const userNickname = ref('未登录')
const currentLevel = ref('')
const selectedPlan = ref('svip')
const submitting = ref(false)

onShow(() => {
  const storedUserInfo = uni.getStorageSync('userInfo')
  if (storedUserInfo) {
    userAvatar.value = storedUserInfo.avatar || '/static/default-avatar.png'
    userNickname.value = storedUserInfo.nickname || '微信用户'
    currentLevel.value = storedUserInfo.memberLevel || ''
  }
})

const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const goBack = () => {
  uni.navigateBack()
}

const handleSubscribe = async () => {
  if (submitting.value) return

  const planInfo = {
    vip: { name: 'VIP会员', price: 99 },
    svip: { name: 'SVIP会员', price: 999 }
  }
  const plan = planInfo[selectedPlan.value]

  uni.showModal({
    title: '确认开通',
    content: `即将开通${plan.name}（${plan.price}元/月），是否继续？`,
    success: (res) => {
      if (res.confirm) {
        processPayment(plan)
      }
    }
  })
}

const processPayment = async (plan) => {
  submitting.value = true
  try {
    // TODO: 接入实际的会员购买云函数
    // 当前使用模拟支付流程，实际开发时需要：
    // 1. 调用 createMemberOrder 云函数创建会员订单
    // 2. 调用 getPayParams 获取微信支付参数
    // 3. 调用 uni.requestPayment 完成支付

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟支付成功，更新本地用户状态
    const storedUserInfo = uni.getStorageSync('userInfo') || {}
    storedUserInfo.memberLevel = selectedPlan.value
    storedUserInfo.memberExpireAt = Date.now() + 30 * 24 * 60 * 60 * 1000
    uni.setStorageSync('userInfo', storedUserInfo)
    currentLevel.value = selectedPlan.value

    uni.showToast({ title: '开通成功', icon: 'success' })
  } catch (e) {
    console.error('Subscribe failed:', e)
    uni.showToast({ title: e.message || '支付失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
// 设计系统颜色变量
$surface: #131313;
$surface-low: #1c1b1b;
$surface-high: #2a2a2a;
$surface-highest: #353534;
$surface-lowest: #0e0e0e;
$surface-variant: #353534;

$primary: #f2ca50;
$primary-container: #d4af37;
$on-primary: #3c2f00;

$secondary: #b8c3ff;
$secondary-container: #0043eb;
$on-secondary-container: #c6ceff;

$on-surface: #e5e2e1;
$on-surface-variant: #d0c5af;
$outline-variant: #4d4635;

// 页面基础
.page {
  min-height: 100vh;
  background-color: $surface;
  padding-bottom: 48px;
}

// 顶部导航栏
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: $surface;
  box-shadow: 0 40px 40px -10px rgba(242, 202, 80, 0.08);
}

.top-bar-content {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.6;
  }
}

.back-icon {
  color: $primary;
  font-size: 28px;
  line-height: 1;
  font-weight: 300;
}

// 主内容区
.main-content {
  padding-top: 60px;
  padding-left: 20px;
  padding-right: 20px;
}

// 用户信息区
.user-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: $surface-low;
  border-radius: 16px;
  padding: 16px;
  overflow: hidden;
}

.watermark {
  position: absolute;
  bottom: -8px;
  left: -4px;
  font-size: 64px;
  font-weight: 900;
  font-style: italic;
  color: $on-surface;
  opacity: 0.06;
  pointer-events: none;
  line-height: 1;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background-color: $surface-highest;
  border: 1px solid rgba($outline-variant, 0.3);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.nickname {
  color: $on-surface;
  font-size: 16px;
  font-weight: 700;
}

.member-badge {
  display: inline-flex;
  align-self: flex-start;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  border-radius: 999px;
  padding: 2px 10px;
}

.badge-text {
  color: $on-primary;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

// 权益网格
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 24px;
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.benefit-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gold-circle {
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  box-shadow: 0 8px 16px -4px rgba(242, 202, 80, 0.35);
}

.blue-circle {
  background: linear-gradient(135deg, $secondary-container 0%, $secondary 100%);
  box-shadow: 0 8px 16px -4px rgba(0, 67, 235, 0.35);
}

.gray-circle {
  background-color: $surface-highest;
  border: 1px solid rgba($outline-variant, 0.3);
}

.icon-text {
  font-size: 22px;
  line-height: 1;
}

.gold-circle .icon-text {
  color: $on-primary;
}

.blue-circle .icon-text {
  color: $on-secondary-container;
}

.gray-circle .icon-text {
  color: $primary;
}

.benefit-label {
  color: $on-surface-variant;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  padding: 0 2px;
}

// 套餐卡片
.plan-section {
  display: flex;
  gap: 14px;
  margin-top: 28px;
}

.plan-card {
  flex: 1;
  height: 160px;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.vip-card {
  background-color: $surface-low;
  border: 1px solid rgba($outline-variant, 0.12);

  &.active {
    border-color: rgba($primary, 0.5);
    box-shadow: 0 0 0 1.5px rgba($primary, 0.2);
  }
}

.svip-card {
  background: rgba($surface-variant, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba($primary, 0.2);
  box-shadow: 0 16px 32px -12px rgba(242, 202, 80, 0.1);

  &.active {
    border-color: rgba($primary, 0.5);
    box-shadow: 0 16px 32px -12px rgba(242, 202, 80, 0.2), 0 0 0 1.5px rgba($primary, 0.15);
  }
}

.plan-watermark {
  position: absolute;
  bottom: -10px;
  right: -6px;
  font-size: 52px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.02em;
  color: $on-surface;
  opacity: 0.04;
  pointer-events: none;
  line-height: 1;
}

.svip-watermark {
  color: $primary;
  opacity: 0.08;
}

.selected-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  background-color: $primary;
  color: $on-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
}

.plan-tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: $on-surface-variant;
}

.svip-tag {
  color: $primary;
  text-shadow: 0 0 8px rgba(242, 202, 80, 0.35);
}

.plan-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: $on-surface;
  font-size: 16px;
  font-weight: 600;
}

.price-num {
  color: $on-surface;
  font-size: 30px;
  font-weight: 800;
  margin-left: 1px;
  letter-spacing: -0.02em;
}

.price-unit {
  color: rgba($on-surface-variant, 0.7);
  font-size: 12px;
  margin-left: 2px;
}

.svip-price {
  color: $primary;
  text-shadow: 0 0 8px rgba(242, 202, 80, 0.3);
}

.svip-unit {
  color: rgba($primary, 0.6);
}

// 按钮
.action-section {
  margin-top: 28px;
}

.subscribe-btn {
  width: 100%;
  height: 54px;
  border-radius: 999px;
  background: linear-gradient(135deg, $primary 0%, $primary-container 100%);
  color: $on-primary;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px -6px rgba(242, 202, 80, 0.3);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  &::after {
    border: none;
  }
}

// Banner
.banner-section {
  margin-top: 28px;
}

.banner-container {
  width: 100%;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background-color: $surface-highest;
  border: 1px solid rgba($outline-variant, 0.12);
}

.banner-image {
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba($surface, 0.8), transparent);
  display: flex;
  align-items: flex-end;
  padding: 14px;
}

.banner-text {
  color: $primary;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.banner-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: $outline-variant;

  &.active {
    width: 20px;
    border-radius: 3px;
    background-color: $primary;
  }
}

// 权益说明
.terms-section {
  margin-top: 28px;
  padding-bottom: 24px;
}

.terms-title {
  color: $on-surface;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 14px;
}

.terms-content {
  background-color: $surface-lowest;
  border-top: 1px solid rgba($outline-variant, 0.15);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.terms-text {
  color: rgba($on-surface-variant, 0.75);
  font-size: 11px;
  line-height: 1.7;
  font-weight: 500;
  text-align: justify;
}
</style>
