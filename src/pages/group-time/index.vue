<template>
  <view class="time-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left" @tap="onBack">
        <text class="nav-back">&#x2190;</text>
      </view>
      <text class="nav-title">Venue</text>
      <view class="nav-right">
        <text class="nav-step">Step 02</text>
      </view>
    </view>

    <scroll-view class="scroll-content" scroll-y>
      <!-- Header -->
      <view class="header-section">
        <view class="header-watermark">TIME</view>
        <text class="step-label">Reservation Process</text>
        <text class="step-title">请选择预约时间</text>
      </view>

      <!-- Time Card -->
      <view class="time-card">
        <!-- Date Row -->
        <view class="date-row">
          <view class="date-info">
            <view class="date-icon-wrap">
              <text class="date-icon">&#x1F4C5;</text>
            </view>
            <view>
              <text class="date-label">Selected Date</text>
              <picker mode="date" :value="selectedDate" @change="onDateChange">
                <text class="date-value">{{ formatDate(selectedDate) }}</text>
              </picker>
            </view>
          </view>
          <view class="date-badge">
            <text class="badge-text">Premium Slot</text>
          </view>
        </view>

        <!-- Time Wheels -->
        <view class="time-wheels">
          <!-- Start Time -->
          <view class="wheel-section">
            <text class="wheel-label">Start</text>
            <view class="wheel-container">
              <view class="wheel-gradient top"></view>
              <view class="wheel-indicator"></view>
              <picker-view class="wheel-picker" :value="[startIndex]" @change="onStartChange" indicator-style="height: 80rpx;">
                <picker-view-column>
                  <view class="wheel-item" v-for="(t, i) in timeSlots" :key="i" :class="{ active: i === startIndex }">
                    <text>{{ t }}</text>
                  </view>
                </picker-view-column>
              </picker-view>
              <view class="wheel-gradient bottom"></view>
            </view>
          </view>

          <!-- Separator -->
          <view class="wheel-separator">
            <text>至</text>
          </view>

          <!-- End Time -->
          <view class="wheel-section">
            <text class="wheel-label">End</text>
            <view class="wheel-container">
              <view class="wheel-gradient top"></view>
              <view class="wheel-indicator"></view>
              <picker-view class="wheel-picker" :value="[endIndex]" @change="onEndChange" indicator-style="height: 80rpx;">
                <picker-view-column>
                  <view class="wheel-item" v-for="(t, i) in timeSlots" :key="i" :class="{ active: i === endIndex }">
                    <text>{{ t }}</text>
                  </view>
                </picker-view-column>
              </picker-view>
              <view class="wheel-gradient bottom"></view>
            </view>
          </view>
        </view>

        <!-- Duration -->
        <view class="duration-chip">
          <text class="duration-icon">&#x23F0;</text>
          <text class="duration-text">Duration: <text class="duration-bold">{{ durationText }}</text></text>
        </view>
      </view>

      <!-- Features -->
      <view class="features-grid">
        <view class="feature-card">
          <text class="feature-icon">&#x2705;</text>
          <text class="feature-text">Priority Booking included with SVIP status</text>
        </view>
        <view class="feature-card">
          <text class="feature-icon">&#x1F3AB;</text>
          <text class="feature-text">Member Exclusive rate: 1,200 Credits</text>
        </view>
      </view>

      <view style="height: 200rpx;"></view>
    </scroll-view>

    <!-- Bottom Action -->
    <view class="bottom-bar">
      <view class="price-info">
        <text class="price-label">Est. Total</text>
        <text class="price-value">&#x00A5;2,800.00</text>
      </view>
      <button class="next-btn" @tap="onNext">
        <text class="btn-text">下一步</text>
        <text class="btn-arrow">&#x2192;</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const targetGender = ref(0)

// Generate time slots from 18:00 to 04:00
const timeSlots = []
for (let h = 18; h <= 23; h++) {
  timeSlots.push(`${h.toString().padStart(2, '0')}:00`)
}
timeSlots.push('00:00', '01:00', '02:00', '03:00', '04:00')

const selectedDate = ref(getTodayString())
const startIndex = ref(2) // 20:00
const endIndex = ref(5)   // 23:00

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

const durationText = computed(() => {
  const start = startIndex.value
  const end = endIndex.value
  if (end <= start) return '1 Hour'
  const hours = end - start
  return `${hours} Hour${hours > 1 ? 's' : ''}`
})

const onDateChange = (e) => {
  selectedDate.value = e.detail.value
}

const onStartChange = (e) => {
  startIndex.value = e.detail.value[0]
  if (endIndex.value <= startIndex.value) {
    endIndex.value = Math.min(startIndex.value + 1, timeSlots.length - 1)
  }
}

const onEndChange = (e) => {
  endIndex.value = e.detail.value[0]
  if (endIndex.value <= startIndex.value) {
    startIndex.value = Math.max(endIndex.value - 1, 0)
  }
}

const onBack = () => {
  uni.navigateBack()
}

const onNext = () => {
  const tg = targetGender.value || uni.getStorageSync('groupTargetGender') || 0
  uni.setStorageSync('groupTargetGender', tg)
  uni.setStorageSync('groupDate', selectedDate.value)
  uni.setStorageSync('groupStartTime', timeSlots[startIndex.value])
  uni.setStorageSync('groupEndTime', timeSlots[endIndex.value])
  const url = `/pages/group-bar/index?targetGender=${tg}&date=${selectedDate.value}&startTime=${timeSlots[startIndex.value]}&endTime=${timeSlots[endIndex.value]}`
  uni.navigateTo({
    url,
    fail: () => uni.redirectTo({ url })
  })
}

onMounted(() => {
  // For non-tab pages in uni-app, we can't use defineProps
  // The page params will be handled when navigating
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.time-page {
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
  background: rgba($bg-primary, 0.9);
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
  font-size: 28rpx;
  font-weight: 600;
  color: $primary;
  letter-spacing: 0.1em;
}

.nav-right {
  width: 80rpx;
  text-align: right;
}

.nav-step {
  font-size: 20rpx;
  color: $primary;
  font-weight: bold;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.8;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Header */
.header-section {
  position: relative;
  padding: 40rpx 40rpx 30rpx;
  overflow: hidden;
}

.header-watermark {
  position: absolute;
  right: -20rpx;
  top: -10rpx;
  font-size: 100rpx;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.03);
  pointer-events: none;
}

.step-label {
  display: block;
  font-size: 20rpx;
  color: $text-secondary;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  margin-bottom: 12rpx;
  opacity: 0.6;
}

.step-title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: $text-primary;
  letter-spacing: 2rpx;
  line-height: 1.2;
}

/* Time Card */
.time-card {
  margin: 0 30rpx;
  background: rgba(53, 53, 52, 0.4);
  backdrop-filter: blur(20px);
  border: 1rpx solid rgba(153, 144, 124, 0.1);
  border-radius: $border-radius-lg;
  padding: 40rpx;
}

/* Date Row */
.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50rpx;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.date-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-icon {
  font-size: 36rpx;
}

.date-label {
  display: block;
  font-size: 18rpx;
  color: $text-secondary;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 4rpx;
}

.date-value {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
}

.date-badge {
  border: 1rpx solid rgba($primary, 0.2);
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.badge-text {
  font-size: 20rpx;
  color: $primary;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Time Wheels */
.time-wheels {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.wheel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.wheel-label {
  text-align: center;
  font-size: 20rpx;
  color: $text-secondary;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.6;
}

.wheel-container {
  position: relative;
  height: 380rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: $border-radius-lg;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.wheel-gradient {
  position: absolute;
  left: 0;
  right: 0;
  height: 80rpx;
  z-index: 10;
  pointer-events: none;
}

.wheel-gradient.top {
  top: 0;
  background: linear-gradient(to bottom, rgba(14, 14, 14, 1), transparent);
}

.wheel-gradient.bottom {
  bottom: 0;
  background: linear-gradient(to top, rgba(14, 14, 14, 1), transparent);
}

.wheel-indicator {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 80rpx;
  background: rgba($primary, 0.05);
  border-top: 1rpx solid rgba($primary, 0.1);
  border-bottom: 1rpx solid rgba($primary, 0.1);
  pointer-events: none;
  z-index: 5;
}

.wheel-picker {
  width: 100%;
  height: 100%;
}

.wheel-item {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: rgba($text-secondary, 0.4);
}

.wheel-item.active {
  color: $primary;
  font-weight: bold;
  font-size: 36rpx;
}

.wheel-separator {
  display: flex;
  align-items: center;
  padding-top: 60rpx;
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

/* Duration */
.duration-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-full;
}

.duration-icon {
  font-size: 28rpx;
}

.duration-text {
  font-size: 22rpx;
  color: $text-secondary;
  letter-spacing: 1rpx;
}

.duration-bold {
  color: $text-primary;
  font-weight: bold;
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 30rpx;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: $border-radius-lg;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.02);
}

.feature-icon {
  font-size: 40rpx;
}

.feature-text {
  font-size: 22rpx;
  line-height: 1.6;
  color: $text-secondary;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30rpx;
  padding: 24rpx 30rpx 48rpx;
  background: rgba($bg-primary, 0.9);
  backdrop-filter: blur(40px);
  border-top: 1rpx solid rgba(255, 255, 255, 0.05);
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.price-label {
  font-size: 20rpx;
  color: $text-secondary;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: bold;
}

.price-value {
  font-size: 40rpx;
  font-weight: 900;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.next-btn {
  flex: 1;
  height: 100rpx;
  border-radius: $border-radius-full;
  background: $primary;
  color: $on-primary;
  font-size: 28rpx;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 16rpx 80rpx -20rpx rgba($primary, 0.4);
  transition: all 0.3s ease;
}

.next-btn::after {
  border: none;
}

.next-btn:active {
  transform: scale(0.97);
}

.btn-text {
  font-weight: 800;
}

.btn-arrow {
  font-size: 28rpx;
}
</style>
