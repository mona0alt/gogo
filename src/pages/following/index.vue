<template>
  <view class="following-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <text class="nav-title">关注</text>
    </view>

    <scroll-view class="scroll-content" scroll-y refresher-enabled :refresher-triggered="refreshing" @scrolltolower="onLoadMore" @refresherrefresh="onRefresh">
      <!-- Follow List -->
      <view v-if="followList.length > 0" class="follow-list">
        <view v-for="(item, index) in followList" :key="index" class="follow-card">
          <image class="follow-avatar" :src="(typeof item.userInfo?.avatar === 'string' && item.userInfo.avatar) || '/static/default-avatar.png'" mode="aspectFill" @error="item.userInfo && (item.userInfo.avatar = '/static/default-avatar.png')" />
          <view class="follow-info">
            <text class="follow-name">{{ item.userInfo?.nickname || '匿名用户' }}</text>
            <text v-if="item.userInfo?.age" class="follow-meta">{{ item.userInfo.age }}岁 · {{ item.userInfo.gender === 1 ? '男' : '女' }}</text>
            <text v-if="item.userInfo?.bio" class="follow-bio">{{ item.userInfo.bio }}</text>
          </view>

          <view class="follow-action" @tap="unfollow(item.openid, index)">
            <text class="unfollow-btn">已关注</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-else-if="!loading" class="empty-state">
        <text class="empty-icon">&#x2661;</text>
        <text class="empty-title">暂无关注</text>
        <text class="empty-desc">在大厅发现感兴趣的拼桌，点击关注即可在这里查看</text>
      </view>

      <view v-if="loading && followList.length === 0" class="loading">
        <text>加载中...</text>
      </view>

      <view v-if="noMore && followList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { showModal, showToast } from '@/utils/feedback'
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { callCloudFunction } from '@/utils/request'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const followList = ref<any[]>([])
const loading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 20

const fetchList = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await callCloudFunction('getFollowList', {
      page: page.value,
      pageSize
    })
    const list = res.list || []
    if (page.value === 1) {
      followList.value = list
    } else {
      followList.value.push(...list)
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
  fetchList()
}

const onLoadMore = () => {
  if (loading.value || noMore.value) return
  page.value++
  fetchList()
}

const unfollow = async (openid: any, index: any) => {
  const res = await showModal({
    title: '取消关注',
    content: '确定要取消关注该用户吗？',
  })
  if (res.confirm) {
    try {
      await callCloudFunction('unfollowUser', { targetOpenid: openid })
      followList.value.splice(index, 1)
      showToast({ title: '已取消关注', icon: 'none' })
    } catch {
      showToast({ title: '操作失败', icon: 'none' })
    }
  }
}

const checkLoginAndFetch = () => {
  if (!userStore.isLoggedIn) {
    followList.value = []
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  page.value = 1
  noMore.value = false
  fetchList()
}

onShow(() => {
  checkLoginAndFetch()
})
</script>

<style lang="scss" scoped>

.following-page {
  min-height: 100vh;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

/* Top Navigation */
.top-nav {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30rpx;
  background: rgba($bg-primary, 0.9);
  backdrop-filter: blur(20px);
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $primary;
  letter-spacing: 4rpx;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
}

/* Follow List */
.follow-list {
  padding: 20rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.follow-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
  background: rgba($bg-hover, 0.3);
  backdrop-filter: blur(20px);
  border-radius: $border-radius-lg;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.follow-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 2rpx solid rgba($outline-variant, 0.2);
  flex-shrink: 0;
}

.follow-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
}

.follow-name {
  font-size: 30rpx;
  font-weight: bold;
  color: $text-primary;
}

.follow-meta {
  font-size: 22rpx;
  color: $text-secondary;
}

.follow-bio {
  font-size: 22rpx;
  color: rgba($text-secondary, 0.8);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-action {
  flex-shrink: 0;
}

.unfollow-btn {
  padding: 10rpx 28rpx;
  border-radius: $border-radius-full;
  background: $bg-hover;
  color: $text-secondary;
  font-size: 24rpx;
  font-weight: 500;
  border: 1rpx solid rgba($outline-variant, 0.2);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
  gap: 24rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: rgba($outline-variant, 0.3);
}

.empty-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.6;
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  color: $text-secondary;
  font-size: 24rpx;
}
</style>
