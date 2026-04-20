<template>
  <view class="invites-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left" @tap="onBack">
        <text class="nav-back">&#x2190;</text>
      </view>
      <text class="nav-title">邀请我的</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view class="scroll-content" scroll-y refresher-enabled :refresher-triggered="refreshing" @scrolltolower="onLoadMore" @refresherrefresh="onRefresh">
      <view v-if="inviteList.length > 0" class="invite-list">
        <view v-for="(item, index) in inviteList" :key="index" class="invite-card">
          <view class="invite-header">
            <image class="invite-avatar" :src="item.fromUser?.avatar || '/static/default-avatar.png'" mode="aspectFill" @error="item.fromUser && (item.fromUser.avatar = '/static/default-avatar.png')" />
            <view class="invite-user-info">
              <text class="invite-nickname">{{ item.fromUser?.nickname || '匿名用户' }}</text>
              <text v-if="item.fromUser?.age" class="invite-meta">{{ item.fromUser.age }}岁</text>
            </view>
            <text class="invite-time">{{ formatTime(item.createdAt) }}</text>
          </view>

          <view class="invite-detail">
            <view class="detail-row">
              <text class="detail-icon">&#x1F378;</text>
              <text class="detail-text">{{ item.group?.barName }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-icon">&#x1F4C5;</text>
              <text class="detail-text">{{ item.group?.date }} {{ item.group?.startTime }}-{{ item.group?.endTime }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-icon">&#x1F4B0;</text>
              <text class="detail-text">{{ item.group?.packageType === '198' ? '198畅饮套餐' : '台费 ¥40' }}</text>
            </view>
          </view>

          <view v-if="item.status === 'pending'" class="invite-actions">
            <button class="action-btn reject" @tap="respond(item._id, 'reject')">拒绝</button>
            <button class="action-btn accept" @tap="respond(item._id, 'accept')">接受</button>
          </view>

          <view v-else class="invite-status">
            <text class="status-text" :class="item.status">{{ statusText(item.status) }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="empty-state">
        <text class="empty-icon">&#x1F48C;</text>
        <text class="empty-title">暂无邀请</text>
        <text class="empty-desc">有人向您发起拼桌邀请时会显示在这里</text>
      </view>

      <view v-if="loading && inviteList.length === 0" class="loading">
        <text>加载中...</text>
      </view>

      <view v-if="noMore && inviteList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { showToast, showLoading, hideLoading } from '@/utils/feedback'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { callCloudFunction } from '@/utils/request'

const userStore = useUserStore()
const inviteList = ref<any[]>([])
const loading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const formatTime = (date: any) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const statusText = (status: any) => {
  const map: Record<string, string> = { pending: '待处理', accepted: '已接受', rejected: '已拒绝', expired: '已过期' }
  return map[status] || status
}

const fetchList = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await callCloudFunction('getMatchInvites', {
      page: page.value,
      pageSize
    })
    const list = res.list || []
    if (page.value === 1) {
      inviteList.value = list
    } else {
      inviteList.value.push(...list)
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

onMounted(() => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  fetchList()
})

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  noMore.value = false
  fetchList()
}

const onLoadMore = () => {
  if (loading.value || noMore.value) return
  page.value++
  fetchList()
}

const respond = async (matchId: any, action: any) => {
  showLoading({ title: '处理中...', mask: true })
  try {
    const res = await callCloudFunction('respondMatch', { matchId, action })
    if (res.error) {
      showToast({ title: res.error, icon: 'none' })
      return
    }
    showToast({ title: action === 'accept' ? '已接受' : '已拒绝', icon: 'success' })
    // Refresh list
    page.value = 1
    noMore.value = false
    fetchList()
  } catch (e: any) {
    showToast({ title: e.message || '操作失败', icon: 'none' })
  } finally {
    hideLoading()
  }
}

const onBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>

.invites-page {
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
  font-size: 32rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 2rpx;
}

.nav-right {
  width: 80rpx;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Invite List */
.invite-list {
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.invite-card {
  background: rgba($bg-hover, 0.3);
  backdrop-filter: blur(20px);
  border-radius: $border-radius-lg;
  padding: 30rpx;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.invite-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.invite-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid rgba($outline-variant, 0.2);
}

.invite-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.invite-nickname {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
}

.invite-meta {
  font-size: 22rpx;
  color: $text-secondary;
}

.invite-time {
  font-size: 20rpx;
  color: $text-secondary;
  opacity: 0.6;
}

/* Invite Detail */
.invite-detail {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid rgba($outline-variant, 0.1);
  border-bottom: 1rpx solid rgba($outline-variant, 0.1);
  margin-bottom: 24rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.detail-icon {
  font-size: 24rpx;
  color: $primary;
}

.detail-text {
  font-size: 26rpx;
  color: $text-primary;
}

/* Actions */
.invite-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: $border-radius-full;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.2s ease;
}

.action-btn::after {
  border: none;
}

.action-btn.reject {
  background: $bg-hover;
  color: $text-secondary;
}

.action-btn.accept {
  background: $primary;
  color: $on-primary;
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.3);
}

.action-btn:active {
  transform: scale(0.97);
}

/* Status */
.invite-status {
  text-align: center;
  padding: 16rpx 0;
}

.status-text {
  font-size: 26rpx;
  font-weight: bold;
}

.status-text.accepted {
  color: #00d26a;
}

.status-text.rejected {
  color: $text-secondary;
}

.status-text.expired {
  color: $text-secondary;
  opacity: 0.6;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
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

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  color: $text-secondary;
  font-size: 24rpx;
}
</style>
