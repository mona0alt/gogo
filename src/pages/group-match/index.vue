<template>
  <view class="match-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left" @tap="onBack">
        <text class="nav-back">&#x2190;</text>
      </view>
      <text class="nav-title">VENUE</text>
      <view class="nav-right"></view>
    </view>

    <view class="content">
      <!-- Card Stack -->
      <view class="card-stack">
        <view
          v-if="currentUser"
          class="user-card"
          :class="{ 'swipe-left': swipeDirection === 'left', 'swipe-right': swipeDirection === 'right' }"
          :style="cardStyle"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- Photo -->
          <view class="photo-section">
            <image
              class="user-photo"
              :src="currentUser.avatar || currentUser.photos?.[0] || '/static/default-avatar.png'"
              mode="aspectFill"
              @error="handlePhotoError"
            />
            <!-- VIP Badge -->
            <view class="vip-badge">
              <view class="vip-dot"></view>
              <text class="vip-text">VIP</text>
            </view>
          </view>

          <!-- User Info -->
          <view class="info-section">
            <view class="name-row">
              <text class="user-name">{{ currentUser.nickname || '匿名用户' }}</text>
              <view v-if="currentUser.gender" class="tag-chip">
                <text class="tag-icon">{{ currentUser.gender === 1 ? '&#x2642;' : '&#x2640;' }}</text>
                <text class="tag-value">{{ currentUser.age || 0 }}</text>
              </view>
              <view v-if="currentUser.zodiac" class="tag-chip">
                <text class="tag-value">{{ currentUser.zodiac }}</text>
              </view>
            </view>

            <!-- Stats -->
            <view v-if="currentUser.height || currentUser.weight" class="stats-row">
              <view v-if="currentUser.height" class="stat-chip">
                <text>{{ currentUser.height }}cm</text>
              </view>
              <view v-if="currentUser.weight" class="stat-chip">
                <text>{{ currentUser.weight }}KG</text>
              </view>
              <view v-if="currentUser.zodiac" class="stat-chip">
                <text>{{ currentUser.zodiac }}</text>
              </view>
            </view>

            <!-- Bio -->
            <view v-if="currentUser.bio" class="bio-section">
              <text class="bio-label">关于我</text>
              <text class="bio-text">{{ currentUser.bio }}</text>
            </view>

            <!-- Interests -->
            <view v-if="currentUser.interests" class="interest-section">
              <view class="interest-card">
                <text class="interest-label">兴趣爱好</text>
                <text class="interest-value">{{ currentUser.interests }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="!currentUser && !loading" class="empty-card">
          <text class="empty-icon">&#x1F37A;</text>
          <text class="empty-title">暂时没有更多推荐</text>
          <text class="empty-desc">稍后再来看看吧</text>
        </view>

        <!-- Loading -->
        <view v-if="loading" class="loading-card">
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </view>

    <!-- Action Bar -->
    <view v-if="currentUser" class="action-bar">
      <view class="action-btn close" @tap="onSkip">
        <text class="action-icon">&#x2715;</text>
      </view>
      <view class="action-btn like" @tap="onLike">
        <text class="action-icon">&#x2665;</text>
      </view>
      <view class="action-btn star" :class="{ active: isFollowing }" @tap="onStar">
        <text class="action-icon">&#x2605;</text>
      </view>
    </view>

    <!-- Exit Button -->
    <view v-if="currentUser" class="exit-bar">
      <text class="exit-text" @tap="onBack">&#x2190; 退出配对</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { callCloudFunction } from '@/utils/request'

const userStore = useUserStore()

const groupId = ref('')

const userList = ref([])
const currentIndex = ref(0)
const loading = ref(false)
const swipeDirection = ref('')
const followedUsers = ref(new Set())
const isProcessing = ref(false)

// Touch drag state
const touchStartX = ref(0)
const touchStartY = ref(0)
const dragOffsetX = ref(0)
const isDragging = ref(false)

const cardStyle = computed(() => {
  if (dragOffsetX.value === 0) return {}
  const rotate = dragOffsetX.value * 0.04
  const opacity = Math.max(0.5, 1 - Math.abs(dragOffsetX.value) / 600)
  return {
    transform: `translateX(${dragOffsetX.value}px) rotate(${rotate}deg)`,
    opacity,
    transition: isDragging.value ? 'none' : 'transform 0.15s ease, opacity 0.15s ease'
  }
})

const currentUser = computed(() => {
  if (currentIndex.value >= userList.value.length) return null
  return userList.value[currentIndex.value]
})

const isFollowing = computed(() => {
  if (!currentUser.value) return false
  return followedUsers.value.has(currentUser.value.openid)
})

const handlePhotoError = () => {
  const user = userList.value[currentIndex.value]
  if (user) {
    if (user.avatar) user.avatar = ''
    else if (user.photos && user.photos.length > 0) user.photos[0] = ''
  }
}

const fetchRecommendUsers = async () => {
  const gid = groupId.value || uni.getStorageSync('currentGroupId')
  if (!gid) {
    uni.showToast({ title: '拼团信息缺失', icon: 'none' })
    return
  }
  uni.setStorageSync('currentGroupId', gid)

  loading.value = true
  try {
    const res = await callCloudFunction('getRecommendUsers', { groupId: gid, limit: 20 })
    userList.value = res.list || []
    if (userList.value.length === 0) {
      uni.showToast({ title: '暂无推荐用户', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goToNext = () => {
  swipeDirection.value = ''
  dragOffsetX.value = 0
  currentIndex.value++
  if (currentIndex.value >= userList.value.length) {
    // Try to load more
    fetchRecommendUsers()
  }
  isProcessing.value = false
}

const onSkip = () => {
  if (isProcessing.value) return
  isProcessing.value = true
  swipeDirection.value = 'left'
  setTimeout(goToNext, 300)
}

const onLike = async () => {
  if (!currentUser.value || isProcessing.value) return

  const gid = groupId.value || uni.getStorageSync('currentGroupId')
  if (!gid) return

  isProcessing.value = true
  uni.showLoading({ title: '发送中...', mask: true })

  try {
    await callCloudFunction('sendMatchRequest', {
      groupId: gid,
      toOpenid: currentUser.value.openid
    })

    uni.showToast({
      title: '已发送配对消息给对方，请耐心等待~',
      icon: 'none',
      duration: 2500
    })

    swipeDirection.value = 'right'
    setTimeout(goToNext, 800)
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' })
    isProcessing.value = false
  } finally {
    uni.hideLoading()
  }
}

const onStar = async () => {
  if (!currentUser.value) return

  const targetOpenid = currentUser.value.openid
  const isNowFollowing = followedUsers.value.has(targetOpenid)

  try {
    if (isNowFollowing) {
      await callCloudFunction('unfollowUser', { targetOpenid })
      followedUsers.value.delete(targetOpenid)
    } else {
      await callCloudFunction('followUser', { targetOpenid })
      followedUsers.value.add(targetOpenid)
      uni.showToast({ title: '已关注对方', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}

// Touch handlers for card swipe
const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  dragOffsetX.value = 0
  isDragging.value = true
}

const onTouchMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value

  // Ignore vertical scroll gestures
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    isDragging.value = false
    dragOffsetX.value = 0
    return
  }

  dragOffsetX.value = deltaX
}

const onTouchEnd = () => {
  if (!isDragging.value || isProcessing.value) {
    isDragging.value = false
    dragOffsetX.value = 0
    return
  }
  isDragging.value = false
  const threshold = 100

  if (dragOffsetX.value > threshold) {
    // Swipe right -> like
    dragOffsetX.value = 0
    onLike()
  } else if (dragOffsetX.value < -threshold) {
    // Swipe left -> skip
    dragOffsetX.value = 0
    onSkip()
  } else {
    // Snap back
    dragOffsetX.value = 0
  }
}

const onBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
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
    groupId.value = current.options.groupId || ''
  }
  fetchRecommendUsers()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.match-page {
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
  font-weight: bold;
  letter-spacing: 0.1em;
  color: $primary;
  text-transform: uppercase;
}

.nav-right {
  width: 80rpx;
}

/* Content */
.content {
  flex: 1;
  padding-top: 88rpx;
  display: flex;
  flex-direction: column;
}

/* Card Stack */
.card-stack {
  flex: 1;
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: column;
}

.user-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: $bg-secondary;
  border-radius: 40rpx;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.1);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.user-card.swipe-left {
  transform: translateX(-120%) rotate(-10deg);
  opacity: 0;
}

.user-card.swipe-right {
  transform: translateX(120%) rotate(10deg);
  opacity: 0;
}

/* Photo Section - use padding-top instead of aspect-ratio for compatibility */
.photo-section {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 125%; /* 4:5 aspect ratio = 5/4 * 100% */
  overflow: hidden;
}

.user-photo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.vip-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: $border-radius-full;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.vip-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: $primary;
  animation: pulse 2s infinite;
}

.vip-text {
  font-size: 20rpx;
  font-weight: 900;
  color: $primary;
  letter-spacing: 0.1em;
}

/* Info Section */
.info-section {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 6rpx 16rpx;
  background: $bg-hover;
  border-radius: $border-radius-full;
  border: 1rpx solid rgba($outline-variant, 0.2);
}

.tag-icon {
  font-size: 22rpx;
  color: $primary;
}

.tag-value {
  font-size: 22rpx;
  font-weight: 600;
  color: $text-primary;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.stat-chip {
  padding: 10rpx 24rpx;
  background: $bg-dim;
  border-radius: 12rpx;
  border: 1rpx solid rgba($outline-variant, 0.15);
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
}

/* Bio */
.bio-section {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.bio-label {
  font-size: 20rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.8;
}

.bio-text {
  font-size: 26rpx;
  color: rgba($text-primary, 0.9);
  line-height: 1.6;
}

/* Interest */
.interest-section {
  margin-top: 4rpx;
}

.interest-card {
  padding: 24rpx;
  background: $bg-dim;
  border-radius: 24rpx;
  border: 1rpx solid rgba($outline-variant, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.interest-label {
  font-size: 18rpx;
  font-weight: bold;
  color: $text-secondary;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.interest-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

/* Empty Card */
.empty-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 60rpx;
}

.empty-icon {
  font-size: 100rpx;
  opacity: 0.5;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
}

.empty-desc {
  font-size: 24rpx;
  color: $text-secondary;
}

.loading-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 28rpx;
  color: $text-secondary;
}

/* Action Bar */
.action-bar {
  position: fixed;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 40rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.action-btn.close {
  width: 96rpx;
  height: 96rpx;
  background: $bg-hover;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
}

.action-btn.close:active {
  transform: scale(0.95);
}

.action-btn.like {
  width: 128rpx;
  height: 128rpx;
  background: $primary;
  box-shadow: 0 0 80rpx -10rpx rgba($primary, 0.4);
}

.action-btn.like:active {
  transform: scale(0.9);
}

.action-btn.star {
  width: 96rpx;
  height: 96rpx;
  background: $bg-hover;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
}

.action-btn.star.active {
  background: rgba($primary, 0.2);
}

.action-btn.star:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 40rpx;
  color: $text-primary;
}

.action-btn.like .action-icon {
  font-size: 56rpx;
  color: $on-primary;
}

.action-btn.star.active .action-icon {
  color: $primary;
}

/* Exit Bar */
.exit-bar {
  position: fixed;
  bottom: 24rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.exit-text {
  font-size: 24rpx;
  color: $text-secondary;
  letter-spacing: 0.1em;
  padding: 12rpx 32rpx;
  border-radius: $border-radius-full;
  transition: all 0.2s ease;
}

.exit-text:active {
  color: $text-primary;
  background: rgba($outline-variant, 0.1);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>