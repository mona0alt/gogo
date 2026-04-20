<template>
  <view class="hall-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left">
        <image class="nav-avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" @error="navAvatarError" />
        <text class="nav-title">拼桌大厅</text>
      </view>
      <text class="nav-settings" @tap="onSettings">⚙</text>
    </view>

    <scroll-view class="scroll-content" scroll-y @scrolltolower="onLoadMore">
      <!-- Filters -->
      <view class="filters-section">
        <view class="filter-grid">
          <view class="filter-item" @tap="onFilterBar">
            <text class="filter-label">选择酒吧</text>
            <text class="filter-arrow">▼</text>
          </view>
          <view class="filter-item" @tap="onFilterPackage">
            <text class="filter-label">套餐类型</text>
            <text class="filter-arrow">▼</text>
          </view>
          <view class="filter-item" @tap="onFilterPeople">
            <text class="filter-label">人数限制</text>
            <text class="filter-arrow">▼</text>
          </view>
          <view class="filter-item" @tap="onFilterTime">
            <text class="filter-label">预定时间</text>
            <text class="filter-arrow">▼</text>
          </view>
        </view>
      </view>

      <!-- VIP Promo Card -->
      <view class="vip-card">
        <view class="vip-watermark">SVIP</view>
        <view class="vip-content">
          <view class="vip-text">
            <text class="vip-title">无需拼桌，快速订台</text>
            <text class="vip-subtitle">尊享会员通道 · 点击这里直接预约</text>
          </view>
          <view class="vip-icon">
            <text class="icon-bolt">⚡</text>
          </view>
        </view>
      </view>

      <!-- Group List -->
      <view class="list-section">
        <view class="list-header">
          <text class="list-title">实时拼桌列表</text>
          <text class="list-badge">更新中...</text>
        </view>

        <view class="group-list">
          <view
            v-for="(item, index) in groupList"
            :key="index"
            class="group-card"
            @tap="onCardTap(item)"
          >
            <view class="card-main">
              <view class="card-header-row">
                <text class="card-title">{{ item.title }}</text>
                <view class="card-time">
                  <text class="time-text">{{ item.time }}</text>
                </view>
              </view>
              <view class="card-meta">
                <view class="meta-item">
                  <text class="meta-icon">🍸</text>
                  <text class="meta-text">{{ item.barName }}</text>
                </view>
                <view class="meta-item">
                  <text class="meta-icon">👥</text>
                  <text class="meta-text">{{ item.people }}</text>
                </view>
              </view>
            </view>
            <view class="card-footer">
              <view class="member-avatars">
                <image
                  v-for="(avatar, i) in item.avatars.slice(0, 3)"
                  :key="i"
                  class="member-avatar"
                  :src="avatar"
                  mode="aspectFill"
                  @error="item.avatars[i] = '/static/default-avatar.png'"
                />
                <view v-if="item.avatars.length > 3" class="member-more">
                  <text class="more-text">+{{ item.avatars.length - 3 }}</text>
                </view>
              </view>
              <view class="join-btn">
                <text class="join-text">加入拼桌</text>
                <text class="join-arrow">›</text>
              </view>
            </view>
          </view>

          <!-- Featured Card -->
          <view class="featured-card" @tap="onCardTap(featuredItem)">
            <image class="featured-bg" src="/static/default-bar.png" mode="aspectFill" />
            <view class="featured-overlay"></view>
            <view class="featured-content">
              <view class="featured-tag-wrap">
                <text class="featured-tag">Featured</text>
                <text class="featured-title">豪华卡座拼桌中</text>
              </view>
              <text class="featured-subtitle">Master Room · 顶级奢享空间</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Floating Publish Button -->
    <view class="fab" @tap="onPublish">
      <text class="fab-icon">+</text>
      <text class="fab-text">立即发布</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const groupList = ref([
  {
    title: '来两个男生，明天晚上一起喝酒，气氛组已到位',
    time: '18:00',
    barName: 'PHX Bar 菲尼克斯',
    people: '3男3女',
    avatars: ['/static/default-avatar.png', '/static/default-avatar.png']
  },
  {
    title: '周末万圣节派对，差两个高颜值小姐姐',
    time: '21:30',
    barName: 'SPACE PLUS',
    people: '4男2女',
    avatars: ['/static/default-avatar.png']
  },
  {
    title: '周五微醺局，寻找有趣的灵魂',
    time: '20:00',
    barName: 'MUSE 酒吧',
    people: '2男4女',
    avatars: ['/static/default-avatar.png', '/static/default-avatar.png', '/static/default-avatar.png']
  }
])

const featuredItem = ref({
  title: '豪华卡座拼桌中',
  barName: 'Master Room',
  time: '22:00',
  people: '6人'
})

const onCardTap = () => {
  uni.navigateTo({ url: '/pages/hall-detail/index' })
}

const onPublish = () => {
  uni.navigateTo({ url: '/pages/hall-create/index' })
}

const onSettings = () => {
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

const onFilterBar = () => {
  uni.showToast({ title: '筛选酒吧', icon: 'none' })
}
const onFilterPackage = () => {
  uni.showToast({ title: '筛选套餐', icon: 'none' })
}
const onFilterPeople = () => {
  uni.showToast({ title: '筛选人数', icon: 'none' })
}
const onFilterTime = () => {
  uni.showToast({ title: '筛选时间', icon: 'none' })
}

const navAvatarError = () => {
  if (userStore.userInfo) userStore.userInfo.avatar = '/static/default-avatar.png'
}

const onLoadMore = () => {
  // TODO: load more
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.hall-page {
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

.nav-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: $bg-hover;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 2rpx;
}

.nav-settings {
  font-size: 36rpx;
  color: $primary;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Filters */
.filters-section {
  padding: 20rpx 30rpx;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-dim;
  border-radius: $border-radius-md;
  padding: 20rpx 24rpx;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.filter-label {
  font-size: 26rpx;
  color: $text-secondary;
}

.filter-arrow {
  font-size: 20rpx;
  color: $primary;
}

/* VIP Card */
.vip-card {
  margin: 0 30rpx 30rpx;
  background: rgba($bg-hover, 0.4);
  backdrop-filter: blur(40px);
  border-radius: $border-radius-lg;
  padding: 40rpx;
  border: 1rpx solid rgba($outline-variant, 0.15);
  position: relative;
  overflow: hidden;
}

.vip-watermark {
  position: absolute;
  right: -30rpx;
  top: -60rpx;
  font-size: 128rpx;
  font-weight: 900;
  font-style: italic;
  color: rgba($primary, 0.08);
  pointer-events: none;
}

.vip-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.vip-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.vip-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 1rpx;
}

.vip-subtitle {
  font-size: 24rpx;
  color: rgba($text-secondary, 0.8);
}

.vip-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40rpx rgba($primary, 0.3);
}

.icon-bolt {
  font-size: 40rpx;
  color: $on-primary;
}

/* List Section */
.list-section {
  padding: 0 30rpx;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx;
  margin-bottom: 24rpx;
}

.list-title {
  font-size: 22rpx;
  font-weight: bold;
  letter-spacing: 0.2em;
  color: $text-secondary;
  text-transform: uppercase;
}

.list-badge {
  font-size: 20rpx;
  color: $primary;
  background: rgba($primary, 0.1);
  padding: 4rpx 16rpx;
  border-radius: $border-radius-full;
}

/* Group Cards */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.group-card {
  background: rgba($bg-hover, 0.4);
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
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
  line-height: 1.4;
  flex: 1;
}

.card-time {
  background: $bg-hover;
  padding: 8rpx 20rpx;
  border-radius: $border-radius-full;
  border: 1rpx solid rgba($outline-variant, 0.2);
  flex-shrink: 0;
}

.time-text {
  font-size: 20rpx;
  font-weight: bold;
  color: $primary;
}

.card-meta {
  display: flex;
  gap: 32rpx;
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
  padding: 20rpx 30rpx;
  background: rgba($bg-secondary, 0.5);
  border-top: 1rpx solid rgba($outline-variant, 0.1);
}

.member-avatars {
  display: flex;
  align-items: center;
}

.member-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 4rpx solid $bg-primary;
  margin-left: -16rpx;
}

.member-avatar:first-child {
  margin-left: 0;
}

.member-more {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $bg-hover;
  border: 4rpx solid $bg-primary;
  margin-left: -16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-text {
  font-size: 16rpx;
  font-weight: bold;
  color: $text-primary;
}

.join-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.join-text {
  font-size: 22rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 2rpx;
  text-transform: uppercase;
}

.join-arrow {
  font-size: 28rpx;
  color: $primary;
}

/* Featured Card */
.featured-card {
  position: relative;
  height: 300rpx;
  border-radius: $border-radius-lg;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30rpx;
}

.featured-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, $bg-primary 0%, rgba($bg-primary, 0.4) 50%, transparent 100%);
}

.featured-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.featured-tag-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.featured-tag {
  font-size: 16rpx;
  font-weight: 900;
  color: $on-primary;
  background: $primary;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  text-transform: uppercase;
}

.featured-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.featured-subtitle {
  font-size: 22rpx;
  color: rgba($text-secondary, 0.9);
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
