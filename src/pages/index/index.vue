<template>
  <view class="index-page">
    <scroll-view class="scroll-content" scroll-y refresher-enabled :refresher-triggered="refreshing" @scrolltolower="onLoadMore" @refresherrefresh="onRefresh">
      <!-- Search Bar -->
      <view class="search-section">
        <view class="search-bar" @tap="goToSearch">
          <text class="search-icon">&#x1F50D;</text>
          <text class="search-placeholder">搜索酒吧名称</text>
        </view>
      </view>

      <!-- Hot Groups Carousel -->
      <view v-if="hotList.length > 0" class="hot-section">
        <view class="section-header">
          <text class="section-label">&#x1F525; 今日热门拼团</text>
          <text class="section-more" @tap="goToHall">更多 &#x203A;</text>
        </view>
        <scroll-view class="hot-scroll" scroll-x>
          <view class="hot-list">
            <view v-for="(item, index) in hotList" :key="index" class="hot-card" @tap="onCardTap(item)">
              <view class="hot-card-bg">
                <view class="hot-card-content">
                  <view class="hot-tag-wrap">
                    <view class="hot-dot"></view>
                    <text class="hot-tag">HOT</text>
                  </view>
                  <text class="hot-title">{{ item.creatorInfo?.nickname || '匿名用户' }}</text>
                  <text class="hot-subtitle">{{ item.barName }}</text>
                  <view class="hot-meta">
                    <text class="hot-time">{{ item.startTime }}</text>
                    <text class="hot-people">{{ formatGenderText(item.targetGender) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- Quick Entry -->
      <view class="quick-section">
        <view class="section-header">
          <text class="section-label">&#x26A1; 快速发起</text>
        </view>
        <view class="quick-grid">
          <view class="quick-item" @tap="startGroupFlow">
            <view class="quick-icon-wrap primary">
              <text class="quick-icon">&#x1F378;</text>
            </view>
            <text class="quick-name">发起拼桌</text>
            <text class="quick-desc">寻找志同道合的酒友</text>
          </view>
          <view class="quick-item" @tap="goToHall">
            <view class="quick-icon-wrap secondary">
              <text class="quick-icon">&#x1F389;</text>
            </view>
            <text class="quick-name">加入拼桌</text>
            <text class="quick-desc">发现附近的拼桌活动</text>
          </view>
        </view>
      </view>

      <!-- Real-time Group List -->
      <view class="list-section">
        <view class="section-header">
          <text class="section-label">&#x1F4CB; 实时拼桌列表</text>
          <view class="list-badge">
            <view class="badge-dot"></view>
            <text class="badge-text">更新中</text>
          </view>
        </view>

        <view class="group-list">
          <view v-for="(item, index) in groupList" :key="index" class="group-card" @tap="onCardTap(item)">
            <view class="card-main">
              <view class="card-header-row">
                <view class="card-user">
                  <image class="card-avatar" :src="item.creatorInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" @error="item.creatorInfo && (item.creatorInfo.avatar = '/static/default-avatar.png')" />
                  <view class="card-user-info">
                    <text class="card-nickname">{{ item.creatorInfo?.nickname || '匿名用户' }}</text>
                    <text v-if="item.creatorInfo?.age" class="card-age">{{ item.creatorInfo.age }}岁</text>
                  </view>
                </view>
                <view class="card-time">
                  <text class="time-text">{{ item.startTime }}</text>
                </view>
              </view>
              <view class="card-title">{{ getGroupTitle(item) }}</view>
              <view class="card-meta">
                <view class="meta-item">
                  <text class="meta-icon">&#x1F378;</text>
                  <text class="meta-text">{{ item.barName }}</text>
                </view>
                <view class="meta-item">
                  <text class="meta-icon">&#x1F4B0;</text>
                  <text class="meta-text">{{ item.packageType === '198' ? '198畅饮套餐' : '台费 ¥40' }}</text>
                </view>
              </view>
            </view>
            <view class="card-footer">
              <view class="card-date">
                <text class="date-text">{{ item.date }}</text>
              </view>
              <view class="join-btn">
                <text class="join-text">加入拼桌</text>
                <text class="join-arrow">&#x203A;</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="loading" class="loading"><text>加载中...</text></view>
        <view v-if="noMore && groupList.length > 0" class="no-more"><text>没有更多了</text></view>
        <view v-if="!loading && groupList.length === 0" class="empty">
          <text class="empty-icon">&#x1F37A;</text>
          <text class="empty-title">暂无拼桌</text>
          <text class="empty-desc">成为第一个发起拼桌的人吧</text>
        </view>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Floating Publish Button -->
    <view class="fab" @tap="startGroupFlow">
      <text class="fab-icon">+</text>
      <text class="fab-text">发起拼桌</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { showToast } from '@/utils/feedback'
import { ref, onMounted } from 'vue'
import { callCloudFunction } from '@/utils/request'
import { resolveCloudAvatar } from '@/utils/cloud'

const hotList = ref<any[]>([])
const groupList = ref<any[]>([])
const loading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const formatGenderText = (gender: any) => {
  if (gender === 1) return '找小哥哥'
  if (gender === 2) return '找小姐姐'
  return '不限性别'
}

const getGroupTitle = (item: any) => {
  const genderText = formatGenderText(item.targetGender)
  return `想${genderText}，一起去${item.barName}`
}

const fetchHotList = async () => {
  try {
    const res = await callCloudFunction('getGroupList', {
      status: 'matching',
      page: 1,
      pageSize: 5,
      excludeOwn: true
    })
    const list = res.list || []
    await Promise.all(list.map(async (item: any) => {
      if (item.creatorInfo?.avatar) {
        item.creatorInfo.avatar = await resolveCloudAvatar(item.creatorInfo.avatar)
      }
    }))
    hotList.value = list
  } catch (e: any) {
    console.error('Fetch hot list failed:', e)
  }
}

const fetchList = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await callCloudFunction('getGroupList', {
      status: 'matching',
      page: page.value,
      pageSize,
      excludeOwn: true
    })
    const list = res.list || []
    await Promise.all(list.map(async (item: any) => {
      if (item.creatorInfo?.avatar) {
        item.creatorInfo.avatar = await resolveCloudAvatar(item.creatorInfo.avatar)
      }
    }))
    if (page.value === 1) {
      groupList.value = list
    } else {
      groupList.value.push(...list)
    }
    if (list.length < pageSize) {
      noMore.value = true
    }
  } catch {
    showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  noMore.value = false
  fetchHotList()
  fetchList()
}

const onLoadMore = () => {
  if (loading.value || noMore.value) return
  page.value++
  fetchList()
}

const startGroupFlow = () => {
  uni.navigateTo({ url: '/pages/group-gender/index' })
}

const goToHall = () => {
  uni.switchTab({ url: '/pages/hall/index' })
}

const goToSearch = () => {
  uni.navigateTo({ url: '/pages/product-search/index' })
}

const onCardTap = (item: any) => {
  uni.navigateTo({ url: `/pages/hall-detail/index?id=${item._id}` })
}

onMounted(() => {
  fetchHotList()
  fetchList()
})
</script>

<style lang="scss" scoped>

.index-page {
  min-height: 100vh;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
}

/* Search */
.search-section {
  padding: 20rpx 30rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background: $bg-secondary;
  border-radius: $border-radius-full;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  color: $text-secondary;
}

.search-placeholder {
  font-size: 26rpx;
  color: rgba($text-secondary, 0.6);
}

/* Hot Section */
.hot-section {
  padding: 20rpx 0 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.section-label {
  font-size: 26rpx;
  font-weight: bold;
  color: $text-primary;
  letter-spacing: 2rpx;
}

.section-more {
  font-size: 24rpx;
  color: $primary;
  letter-spacing: 1rpx;
}

.hot-scroll {
  white-space: nowrap;
}

.hot-list {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
}

.hot-card {
  flex-shrink: 0;
  width: 280rpx;
  height: 340rpx;
  border-radius: $border-radius-xl;
  overflow: hidden;
  position: relative;
}

.hot-card-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba($primary, 0.15) 0%, rgba($secondary, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 1rpx solid rgba($outline-variant, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24rpx;
}

.hot-tag-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.hot-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $primary;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hot-tag {
  font-size: 20rpx;
  font-weight: 900;
  color: $primary;
  letter-spacing: 0.1em;
}

.hot-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.hot-subtitle {
  font-size: 22rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.hot-time {
  font-size: 20rpx;
  color: $primary;
  font-weight: 600;
  background: rgba($primary, 0.1);
  padding: 4rpx 12rpx;
  border-radius: $border-radius-full;
}

.hot-people {
  font-size: 20rpx;
  color: $text-secondary;
}

/* Quick Entry */
.quick-section {
  padding: 0 30rpx 30rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.quick-item {
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  border: 1rpx solid rgba($outline-variant, 0.1);
  transition: transform 0.2s ease;
}

.quick-item:active {
  transform: scale(0.97);
}

.quick-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-icon-wrap.primary {
  background: rgba($primary, 0.15);
}

.quick-icon-wrap.secondary {
  background: rgba($secondary, 0.15);
}

.quick-icon {
  font-size: 36rpx;
}

.quick-name {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-primary;
}

.quick-desc {
  font-size: 22rpx;
  color: $text-secondary;
  text-align: center;
}

/* List Section */
.list-section {
  padding: 0 30rpx;
}

.list-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba($primary, 0.08);
  padding: 4rpx 16rpx;
  border-radius: $border-radius-full;
}

.badge-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: $primary;
  animation: pulse 2s infinite;
}

.badge-text {
  font-size: 20rpx;
  color: $primary;
  font-weight: 500;
}

/* Group Cards */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.group-card {
  background: rgba($bg-hover, 0.3);
  backdrop-filter: blur(20px);
  border-radius: $border-radius-lg;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.1);
  transition: transform 0.2s ease;
}

.group-card:active {
  transform: scale(0.98);
}

.card-main {
  padding: 28rpx;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-user {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.card-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2rpx solid rgba($outline-variant, 0.2);
}

.card-user-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.card-nickname {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-primary;
}

.card-age {
  font-size: 22rpx;
  color: $text-secondary;
}

.card-time {
  background: $bg-dim;
  padding: 8rpx 20rpx;
  border-radius: $border-radius-full;
  border: 1rpx solid rgba($outline-variant, 0.2);
}

.time-text {
  font-size: 20rpx;
  font-weight: bold;
  color: $primary;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon {
  font-size: 24rpx;
}

.meta-text {
  font-size: 22rpx;
  color: $text-secondary;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx;
  background: rgba($bg-secondary, 0.5);
  border-top: 1rpx solid rgba($outline-variant, 0.08);
}

.card-date {
  font-size: 22rpx;
  color: $text-secondary;
}

.join-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.join-text {
  font-size: 24rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 2rpx;
  text-transform: uppercase;
}

.join-arrow {
  font-size: 28rpx;
  color: $primary;
}

/* Loading / Empty */
.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  color: $text-secondary;
  font-size: 24rpx;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
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
  text-align: center;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 180rpx;
  right: 30rpx;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: $secondary;
  color: $on-secondary;
  padding: 24rpx 36rpx;
  border-radius: $border-radius-full;
  box-shadow: 0 12rpx 48rpx rgba($secondary, 0.4);
  transition: all 0.3s ease;
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.fab-text {
  font-size: 26rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
}
</style>
