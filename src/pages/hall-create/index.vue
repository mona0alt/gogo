<template>
  <view class="hall-create-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-back-btn" @tap="onBack">
        <text class="nav-back">←</text>
      </view>
      <text class="nav-title">发布消息</text>
      <view class="nav-spacer"></view>
    </view>

    <scroll-view class="scroll-content" scroll-y>
      <!-- Hero Visual -->
      <view class="hero-visual">
        <image class="hero-img" src="/static/default-bar.png" mode="aspectFill" />
        <view class="hero-overlay"></view>
        <view class="hero-text">
          <text class="hero-label">New Event</text>
          <text class="hero-title">INITIATE PARTY</text>
        </view>
      </view>

      <!-- Form -->
      <view class="form-section">
        <!-- Title -->
        <view class="form-card">
          <text class="form-label">拼团标题</text>
          <input
            v-model="form.title"
            class="form-input"
            type="text"
            placeholder="请输入"
            placeholder-class="placeholder"
          />
        </view>

        <!-- Grid Fields -->
        <view class="form-grid">
          <view class="form-card selectable" @tap="onSelectBar">
            <text class="form-label">预约酒吧</text>
            <view class="select-row">
              <text class="select-value">{{ form.bar || '请选择' }}</text>
              <text class="select-arrow">›</text>
            </view>
          </view>

          <view class="form-card selectable" @tap="onSelectPackage">
            <text class="form-label">套餐类型</text>
            <view class="select-row">
              <text class="select-value">{{ form.packageType || '畅饮套餐' }}</text>
              <text class="select-arrow">›</text>
            </view>
          </view>

          <view class="form-card selectable" @tap="onSelectTime">
            <text class="form-label">预约时间</text>
            <view class="select-row">
              <text class="select-value">{{ form.time || '请选择' }}</text>
              <text class="select-arrow">📅</text>
            </view>
          </view>

          <view class="form-card selectable" @tap="onSelectType">
            <text class="form-label">拼团类型</text>
            <view class="select-row">
              <text class="select-value">{{ form.groupType || '多人' }}</text>
              <text class="select-arrow">👥</text>
            </view>
          </view>
        </view>

        <!-- Group Size -->
        <view class="form-card size-card">
          <text class="size-watermark">MEMBERS</text>
          <view class="size-content">
            <text class="form-label gold">拼团人数</text>
            <view class="size-row">
              <view class="size-info">
                <text class="size-value">{{ form.size }}</text>
                <text class="size-desc">Balanced Social Composition</text>
              </view>
              <text class="size-icon">⚙</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Terms -->
      <view class="terms">
        <text class="terms-text">By initiating a group, you agree to the obsidian terms of service and high-end etiquette protocols.</text>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Bottom Action -->
    <view class="bottom-action">
      <view class="submit-btn" @tap="onSubmit">
        <text class="submit-text">开启拼团</text>
        <text class="submit-icon">⚡</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { showToast } from '@/utils/feedback'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const form = ref({
  title: '',
  bar: '',
  packageType: '畅饮套餐',
  time: '',
  groupType: '多人',
  size: '3男3女'
})

onMounted(() => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
})

const onBack = () => {
  uni.navigateBack()
}

const onSelectBar = () => {
  showToast({ title: '选择酒吧', icon: 'none' })
}
const onSelectPackage = () => {
  showToast({ title: '选择套餐', icon: 'none' })
}
const onSelectTime = () => {
  showToast({ title: '选择时间', icon: 'none' })
}
const onSelectType = () => {
  showToast({ title: '选择类型', icon: 'none' })
}

const onSubmit = () => {
  if (!form.value.title.trim()) {
    showToast({ title: '请输入拼团标题', icon: 'none' })
    return
  }
  showToast({ title: '发布成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 800)
}
</script>

<style lang="scss" scoped>

.hall-create-page {
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
  background: $bg-primary;
}

.nav-back-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.nav-back-btn:active {
  background: rgba($bg-hover, 0.5);
}

.nav-back {
  font-size: 32rpx;
  color: $primary;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 1rpx;
}

.nav-spacer {
  width: 80rpx;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 300rpx;
  margin: 30rpx 30rpx 50rpx;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.5);
}

.hero-img {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, $bg-primary, transparent);
}

.hero-text {
  position: absolute;
  bottom: 36rpx;
  left: 36rpx;
}

.hero-label {
  display: block;
  font-size: 22rpx;
  letter-spacing: 0.15em;
  color: $text-secondary;
  text-transform: uppercase;
  margin-bottom: 8rpx;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: 900;
  letter-spacing: -2rpx;
  color: $primary;
}

/* Form Section */
.form-section {
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-card {
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 36rpx;
  border: 1rpx solid rgba($outline-variant, 0.15);
  transition: all 0.3s ease;
}

.form-card.selectable:active {
  background: $bg-card;
}

.form-label {
  display: block;
  font-size: 20rpx;
  font-weight: 500;
  letter-spacing: 0.15em;
  color: $text-secondary;
  text-transform: uppercase;
  margin-bottom: 24rpx;
}

.form-label.gold {
  color: $primary;
}

.form-input {
  width: 100%;
  font-size: 32rpx;
  color: $text-primary;
  background: transparent;
  border: none;
  border-bottom: 2rpx solid $outline-variant;
  padding: 16rpx 0;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: $primary;
}

.select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-value {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.select-arrow {
  font-size: 28rpx;
  color: $primary;
  transition: transform 0.3s ease;
}

.form-card.selectable:active .select-arrow {
  transform: translateX(8rpx);
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

/* Size Card */
.size-card {
  position: relative;
  overflow: hidden;
}

.size-watermark {
  position: absolute;
  right: -40rpx;
  bottom: -60rpx;
  font-size: 96rpx;
  font-weight: 900;
  font-style: italic;
  color: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.size-content {
  position: relative;
  z-index: 1;
}

.size-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.size-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.size-value {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-primary;
}

.size-desc {
  font-size: 22rpx;
  color: rgba($text-secondary, 0.6);
}

.size-icon {
  font-size: 48rpx;
  color: $primary;
}

/* Terms */
.terms {
  margin-top: 60rpx;
  padding: 0 40rpx;
}

.terms-text {
  font-size: 22rpx;
  line-height: 1.6;
  color: rgba($text-secondary, 0.4);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

/* Bottom Action */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 30rpx;
  padding-bottom: 60rpx;
  background: rgba($bg-primary, 0.9);
  backdrop-filter: blur(40rpx);
  border-top: 1rpx solid rgba($outline-variant, 0.15);
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: $primary;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 0 80rpx -20rpx rgba($primary, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:active {
  transform: scale(0.95);
}

.submit-text {
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: $on-primary;
  text-transform: uppercase;
}

.submit-icon {
  font-size: 32rpx;
}
</style>