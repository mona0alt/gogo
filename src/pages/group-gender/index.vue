<template>
  <view class="gender-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left" @tap="onBack">
        <text class="nav-back">&#x2190;</text>
      </view>
      <text class="nav-title">VENUE</text>
      <view class="nav-right"></view>
    </view>

    <view class="content">
      <!-- Header -->
      <view class="header-section">
        <text class="step-label">Onboarding Step 01</text>
        <text class="step-title">请选择对方性别</text>
        <text class="step-subtitle">定制您的专属高奢社交体验</text>
      </view>

      <!-- Gender Selection -->
      <view class="gender-grid">
        <view
          class="gender-card"
          :class="{ active: selectedGender === 1 }"
          @tap="selectedGender = 1"
        >
          <view class="gender-watermark">MR</view>
          <view class="gender-icon-wrap">
            <text class="gender-icon male">&#x2642;</text>
          </view>
          <view class="gender-info">
            <text class="gender-name">小哥哥</text>
            <text class="gender-en">Gentleman</text>
          </view>
          <view class="gender-check" v-if="selectedGender === 1">
            <text class="check-icon">&#x2713;</text>
          </view>
        </view>

        <view
          class="gender-card"
          :class="{ active: selectedGender === 2 }"
          @tap="selectedGender = 2"
        >
          <view class="gender-watermark">MS</view>
          <view class="gender-icon-wrap">
            <text class="gender-icon female">&#x2640;</text>
          </view>
          <view class="gender-info">
            <text class="gender-name">小姐姐</text>
            <text class="gender-en">Lady</text>
          </view>
          <view class="gender-check" v-if="selectedGender === 2">
            <text class="check-icon">&#x2713;</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Bottom Action -->
    <view class="bottom-bar">
      <button class="next-btn" :disabled="!selectedGender" @tap="onNext">
        <text class="btn-text">下一步</text>
        <text class="btn-arrow">&#x2192;</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const selectedGender = ref(0)

const onBack = () => {
  uni.navigateBack()
}

const onNext = () => {
  if (!selectedGender.value) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }
  const url = `/pages/group-time/index?targetGender=${selectedGender.value}`
  uni.navigateTo({
    url,
    fail: () => uni.redirectTo({ url })
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.gender-page {
  min-height: 100vh;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

/* Top Navigation */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  background: rgba($bg-primary, 0.8);
  backdrop-filter: blur(20px);
}

.nav-left {
  width: 80rpx;
}

.nav-back {
  font-size: 36rpx;
  color: $primary;
}

.nav-title {
  font-size: 24rpx;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: $primary;
  text-transform: uppercase;
}

.nav-right {
  width: 80rpx;
}

/* Content */
.content {
  flex: 1;
  padding: 120rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-section {
  text-align: center;
  margin-bottom: 60rpx;
}

.step-label {
  display: block;
  font-size: 22rpx;
  font-weight: bold;
  color: $text-secondary;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 16rpx;
}

.step-title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}

.step-subtitle {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
}

/* Gender Grid */
.gender-grid {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.gender-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: rgba($bg-hover, 0.4);
  backdrop-filter: blur(24px);
  border-radius: $border-radius-lg;
  border: 1rpx solid rgba($outline-variant, 0.1);
  transition: all 0.4s ease;
  overflow: hidden;
}

.gender-card.active {
  border: 2rpx solid $primary;
  background: rgba($bg-hover, 0.6);
  box-shadow: 0 0 60rpx -10rpx rgba($primary, 0.25);
}

.gender-watermark {
  position: absolute;
  right: -10rpx;
  top: -20rpx;
  font-size: 100rpx;
  font-weight: 900;
  color: rgba($primary, 0.05);
  pointer-events: none;
}

.gender-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $bg-dim;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.gender-card:active .gender-icon-wrap {
  transform: scale(1.1);
}

.gender-icon {
  font-size: 56rpx;
}

.gender-icon.male {
  color: $secondary;
}

.gender-icon.female {
  color: #ff6b9d;
}

.gender-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.gender-name {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
}

.gender-en {
  font-size: 22rpx;
  color: $text-secondary;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.gender-check {
  margin-left: auto;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 28rpx;
  color: $on-primary;
  font-weight: bold;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 30rpx 40rpx 60rpx;
  background: rgba($bg-primary, 0.9);
  backdrop-filter: blur(40px);
}

.next-btn {
  width: 100%;
  height: 100rpx;
  border-radius: $border-radius-full;
  background: $primary;
  color: $on-primary;
  font-size: 30rpx;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: none;
  box-shadow: 0 15rpx 40rpx -10rpx rgba($primary, 0.3);
  transition: all 0.3s ease;
}

.next-btn::after {
  border: none;
}

.next-btn[disabled] {
  opacity: 0.4;
}

.next-btn:not([disabled]):active {
  transform: scale(0.97);
}

.btn-text {
  font-weight: 800;
}

.btn-arrow {
  font-size: 28rpx;
}
</style>
