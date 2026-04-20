<template>
  <view class="bar-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left" @tap="onBack">
        <text class="nav-back">&#x2190;</text>
      </view>
      <text class="nav-title">Venue</text>
      <view class="nav-right">
        <text class="nav-icon">&#x1F50D;</text>
      </view>
    </view>

    <scroll-view class="scroll-content" scroll-y>
      <!-- Header -->
      <view class="header-section">
        <text class="step-label">Step 03 / Reservation</text>
        <text class="step-title">请选择酒吧及套餐</text>
      </view>

      <!-- Selected Bar with Packages -->
      <view v-if="selectedBar" class="selected-bar">
        <view class="bar-header" @tap="toggleExpand">
          <view class="bar-info">
            <view class="bar-img-wrap">
              <image class="bar-img" :src="selectedBar.coverImage || '/static/default-bar.png'" mode="aspectFill" />
            </view>
            <view class="bar-text">
              <text class="bar-name">{{ selectedBar.name }}</text>
              <view class="bar-tag-wrap">
                <text class="bar-tag-num">1</text>
                <text class="bar-tag-text">官方推荐</text>
              </view>
            </view>
          </view>
          <text class="expand-icon" :class="{ rotated: expanded }">&#x25BC;</text>
        </view>

        <!-- Package Selection -->
        <view v-if="expanded" class="package-section">
          <text class="package-label">Available Packages</text>
          <view class="package-list">
            <view
              class="package-item"
              :class="{ active: selectedPackage === '198' }"
              @tap="selectedPackage = '198'"
            >
              <view class="package-info">
                <text class="package-name">198畅饮套餐</text>
                <text class="package-desc">含多种指定洋酒、啤酒及精选小食</text>
              </view>
              <view class="package-action">
                <text class="package-price">&#x00A5;198</text>
                <view class="select-btn primary" :class="{ active: selectedPackage === '198' }">
                  <text>{{ selectedPackage === '198' ? '已选' : '选择' }}</text>
                </view>
              </view>
            </view>

            <view
              class="package-item"
              :class="{ active: selectedPackage === '40' }"
              @tap="selectedPackage = '40'"
            >
              <view class="package-info">
                <text class="package-name">不订购套餐 <text class="package-note">(40台费)</text></text>
                <text class="package-desc">基础入场费用，按单点消费结算</text>
              </view>
              <view class="package-action">
                <text class="package-price muted">&#x00A5;40</text>
                <view class="select-btn" :class="{ active: selectedPackage === '40' }">
                  <text>{{ selectedPackage === '40' ? '已选' : '选择' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Other Bars -->
      <view class="other-section">
        <text class="other-label">Other Destinations</text>
        <view class="other-list">
          <view
            v-for="(bar, index) in otherBars"
            :key="index"
            class="other-bar"
            @tap="selectBar(bar)"
          >
            <view class="other-info">
              <view class="other-img-wrap">
                <image class="other-img" :src="bar.coverImage || '/static/default-bar.png'" mode="aspectFill" />
              </view>
              <text class="other-name">{{ bar.name }}</text>
            </view>
            <text class="other-arrow">&#x203A;</text>
          </view>
        </view>
      </view>

      <view style="height: 200rpx;"></view>
    </scroll-view>

    <!-- Bottom Action -->
    <view class="bottom-bar">
      <button class="next-btn" :disabled="!selectedPackage" @tap="onNext">
        <text class="btn-text">下一步</text>
        <text class="btn-arrow">&#x2192;</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBarStore } from '@/stores/bar'
import { callCloudFunction } from '@/utils/request'

const userStore = useUserStore()
const barStore = useBarStore()

const targetGender = ref(0)
const date = ref('')
const startTime = ref('')
const endTime = ref('')

const selectedBar = ref(null)
const selectedPackage = ref('')
const expanded = ref(true)
const otherBars = ref([])

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const selectBar = (bar) => {
  selectedBar.value = bar
  selectedPackage.value = ''
  expanded.value = true
}

const fetchBars = async () => {
  try {
    const data = await barStore.fetchBarList({ page: 1, pageSize: 20 })
    const list = data?.list || []
    if (list.length > 0) {
      selectedBar.value = list[0]
      otherBars.value = list.slice(1)
    }
  } catch (e) {
    console.error('Fetch bars failed:', e)
    uni.showToast({ title: '加载酒吧失败', icon: 'none' })
  }
}

const onBack = () => {
  uni.navigateBack()
}

const onNext = async () => {
  if (!selectedPackage.value) {
    uni.showToast({ title: '请选择套餐', icon: 'none' })
    return
  }
  if (!selectedBar.value) {
    uni.showToast({ title: '请选择酒吧', icon: 'none' })
    return
  }

  const tg = targetGender.value || uni.getStorageSync('groupTargetGender') || 0
  const d = date.value || uni.getStorageSync('groupDate') || ''
  const st = startTime.value || uni.getStorageSync('groupStartTime') || ''
  const et = endTime.value || uni.getStorageSync('groupEndTime') || ''

  uni.showLoading({ title: '创建中...', mask: true })

  try {
    const res = await callCloudFunction('createGroup', {
      targetGender: tg,
      barId: selectedBar.value.id || selectedBar.value._id,
      barName: selectedBar.value.name,
      packageType: selectedPackage.value,
      date: d,
      startTime: st,
      endTime: et
    })

    uni.hideLoading()

    if (res.error) {
      uni.showToast({ title: res.error, icon: 'none', duration: 3000 })
      return
    }

    if (!res.groupId) {
      uni.showToast({ title: '创建失败：未返回拼团ID', icon: 'none', duration: 3000 })
      return
    }

    uni.setStorageSync('currentGroupId', res.groupId)
    const url = `/pages/group-match/index?groupId=${res.groupId}`
    uni.navigateTo({
      url,
      fail: () => uni.redirectTo({ url })
    })
  } catch (e) {
    uni.hideLoading()
    console.error('createGroup error:', e)
    uni.showToast({ title: e.message || '创建失败，请检查网络', icon: 'none', duration: 3000 })
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (current && current.options) {
    targetGender.value = Number(current.options.targetGender) || 0
    date.value = current.options.date || ''
    startTime.value = current.options.startTime || ''
    endTime.value = current.options.endTime || ''
  }
  fetchBars()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.bar-page {
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
  font-size: 28rpx;
  font-weight: 600;
  color: $primary;
  letter-spacing: 0.1em;
}

.nav-right {
  width: 80rpx;
  text-align: right;
}

.nav-icon {
  font-size: 28rpx;
  color: $text-secondary;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Header */
.header-section {
  padding: 30rpx 30rpx 20rpx;
}

.step-label {
  display: block;
  font-size: 20rpx;
  color: $text-secondary;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 12rpx;
}

.step-title {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
  color: $text-primary;
  letter-spacing: 1rpx;
}

/* Selected Bar */
.selected-bar {
  margin: 0 30rpx;
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.2);
}

.bar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
}

.bar-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.bar-img-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.2);
}

.bar-img {
  width: 100%;
  height: 100%;
}

.bar-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.bar-name {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
}

.bar-tag-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.bar-tag-num {
  background: rgba($primary, 0.2);
  color: $primary;
  font-size: 18rpx;
  font-weight: bold;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.bar-tag-text {
  font-size: 20rpx;
  color: $primary;
  font-weight: 500;
}

.expand-icon {
  font-size: 28rpx;
  color: $text-secondary;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* Package Section */
.package-section {
  background: rgba($bg-primary, 0.3);
  border-top: 1rpx solid rgba($outline-variant, 0.1);
  padding: 0 30rpx 30rpx;
}

.package-label {
  display: block;
  font-size: 20rpx;
  font-weight: bold;
  color: $text-secondary;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 24rpx 0 16rpx;
}

.package-list {
  display: flex;
  flex-direction: column;
}

.package-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1rpx solid rgba($outline-variant, 0.1);
  transition: all 0.2s ease;
}

.package-item:last-child {
  border-bottom: none;
}

.package-item.active {
  background: rgba($primary, 0.05);
  margin: 0 -30rpx;
  padding: 28rpx 30rpx;
}

.package-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.package-name {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
}

.package-note {
  font-size: 24rpx;
  font-weight: normal;
  color: $text-secondary;
}

.package-desc {
  font-size: 22rpx;
  color: $text-secondary;
}

.package-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12rpx;
  flex-shrink: 0;
}

.package-price {
  font-size: 32rpx;
  font-weight: 900;
  color: $text-primary;
}

.package-price.muted {
  color: $text-secondary;
}

.select-btn {
  padding: 8rpx 28rpx;
  border-radius: 12rpx;
  background: $bg-hover;
  color: $text-primary;
  font-size: 22rpx;
  font-weight: bold;
  border: 1rpx solid rgba($outline-variant, 0.3);
}

.select-btn.primary {
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  color: $on-primary;
  border: none;
}

.select-btn.active {
  background: $primary;
  color: $on-primary;
  border: none;
}

/* Other Section */
.other-section {
  padding: 30rpx;
}

.other-label {
  display: block;
  font-size: 20rpx;
  font-weight: bold;
  color: $text-secondary;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 20rpx;
  padding-left: 8rpx;
}

.other-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.other-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  border: 1rpx solid rgba($outline-variant, 0.15);
  transition: all 0.2s ease;
}

.other-bar:active {
  background: $bg-hover;
}

.other-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.other-img-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.other-img {
  width: 100%;
  height: 100%;
}

.other-name {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
}

.other-arrow {
  font-size: 32rpx;
  color: $text-secondary;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 24rpx 30rpx 48rpx;
  background: rgba($bg-primary, 0.95);
  backdrop-filter: blur(40px);
  border-top: 1rpx solid rgba($outline-variant, 0.1);
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
