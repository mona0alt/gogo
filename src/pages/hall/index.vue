<template>
  <view class="hall-page">
    <!-- Top Navigation -->
    <view class="top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <image class="nav-avatar" :src="navAvatar" mode="aspectFill" @error="navAvatarError" />
        <text class="nav-title">拼桌大厅</text>
      </view>
      <text class="nav-settings" @tap="onSettings">⚙</text>
    </view>

    <scroll-view class="scroll-content" scroll-y :style="{ paddingTop: navHeightRpx + 'rpx' }" @scrolltolower="onLoadMore">
      <!-- Filters -->
      <view class="filters-section">
        <view class="filter-grid">
          <view class="filter-item" :class="{ active: filters.barId }" @tap="onFilterBar">
            <text class="filter-label">{{ filters.barName }}</text>
            <text class="filter-arrow">▼</text>
          </view>
          <view class="filter-item" :class="{ active: filters.packageType }" @tap="onFilterPackage">
            <text class="filter-label">{{ filters.packageTypeName }}</text>
            <text class="filter-arrow">▼</text>
          </view>
          <view class="filter-item" :class="{ active: filters.people }" @tap="onFilterPeople">
            <text class="filter-label">{{ filters.peopleName }}</text>
            <text class="filter-arrow">▼</text>
          </view>
          <view class="filter-item" :class="{ active: filters.date }" @tap="onFilterTime">
            <text class="filter-label">{{ filters.dateName }}</text>
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

      <!-- Loading / Empty / No More -->
      <view v-if="loading && groupList.length === 0" class="loading">
        <text>加载中...</text>
      </view>
      <view v-if="!loading && groupList.length === 0" class="empty-state">
        <text class="empty-icon">&#x1F378;</text>
        <text class="empty-title">暂无拼桌</text>
        <text class="empty-desc">点击右下角发布按钮，创建你的拼桌活动</text>
      </view>
      <view v-if="noMore && groupList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Floating Publish Button -->
    <view class="fab" @tap="onPublish">
      <text class="fab-icon">+</text>
      <text class="fab-text">立即发布</text>
    </view>

    <!-- Bottom Sheet -->
    <view v-if="sheetVisible" class="sheet-mask" @tap="onSheetMaskTap">
      <view class="sheet-container" @tap.stop>
        <view class="sheet-header">
          <text class="sheet-title">{{ sheetTitle }}</text>
          <view class="sheet-close" @tap="closeSheet">✕</view>
        </view>
        <view class="sheet-body">
          <view
            v-for="(opt, idx) in sheetOptions"
            :key="idx"
            class="sheet-item"
            :class="{ active: idx === activeSheetIndex }"
            @tap="onSheetSelect(idx)"
          >
            <text class="sheet-item-text">{{ opt }}</text>
            <text v-if="idx === activeSheetIndex" class="sheet-item-check">✓</text>
          </view>
        </view>
        <view class="sheet-footer">
          <view class="sheet-cancel" @tap="closeSheet">取消</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { showToast } from '@/utils/feedback'
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { groupApi, barApi } from '@/api/index'
import type { GroupWithCreator } from '@/types/domain'
import { resolveCloudAvatar } from '@/utils/cloud'

const userStore = useUserStore()

const statusBarHeight = ref(0)
const windowWidth = ref(375)
const navHeightRpx = ref(88)
const initSystemInfo = () => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 0
    windowWidth.value = info.windowWidth || 375
    const sbRpx = statusBarHeight.value * (750 / windowWidth.value)
    navHeightRpx.value = Math.round(88 + sbRpx)
  } catch {
    statusBarHeight.value = 0
    windowWidth.value = 375
    navHeightRpx.value = 88
  }
}

interface DisplayGroup {
  _id: string
  title: string
  time: string
  barName: string
  people: string
  avatars: string[]
}

const groupList = ref<DisplayGroup[]>([])
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 20

const barList = ref<{ id: string; name: string }[]>([])
const navAvatar = ref('/static/default-avatar.png')

const filters = ref({
  barId: '',
  barName: '选择酒吧',
  packageType: '',
  packageTypeName: '套餐类型',
  people: '',
  peopleName: '人数限制',
  date: '',
  dateName: '预定时间'
})

const packageOptions = ['全部', '畅饮套餐', '酒水套餐', '小吃套餐', 'VIP套餐']
const peopleOptions = ['全部', '2人', '4人', '6人', '8人+']
const dateOptions = ['全部', '今天', '明天', '后天']

const formatGroup = (group: GroupWithCreator): DisplayGroup => {
  const creatorAvatar = group.creatorInfo?.avatar || '/static/default-avatar.png'
  return {
    _id: group._id,
    title: group.title || `${group.barName} · ${group.packageType}`,
    time: group.startTime || '',
    barName: group.barName || '',
    people: group.people || '不限人数',
    avatars: [creatorAvatar]
  }
}

const fetchBarList = async () => {
  try {
    const res = await barApi.getList({ page: 1, pageSize: 100 })
    barList.value = res.list.map((b) => ({ id: b.id, name: b.name }))
  } catch {
    // ignore
  }
}

const fetchGroupList = async (reset = false) => {
  if (loading.value || (noMore.value && !reset)) return
  loading.value = true
  if (reset) {
    page.value = 1
    noMore.value = false
  }
  try {
    const params: Record<string, unknown> = {
      status: 'matching',
      page: page.value,
      pageSize
    }
    if (filters.value.barId) params.barId = filters.value.barId
    if (filters.value.packageType) params.packageType = filters.value.packageType
    if (filters.value.date) params.date = filters.value.date
    if (filters.value.people) params.people = filters.value.people

    const res = await groupApi.getList(params)
    const list = (res.list || []).map(formatGroup)
    await Promise.all(list.map(async (item: DisplayGroup) => {
      if (item.avatars[0] && item.avatars[0] !== '/static/default-avatar.png') {
        item.avatars[0] = await resolveCloudAvatar(item.avatars[0])
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
  }
}

const sheetVisible = ref(false)
const sheetTitle = ref('')
const sheetOptions = ref<string[]>([])
const activeSheetIndex = ref(-1)
// eslint-disable-next-line no-unused-vars
let sheetCallback: ((index: number) => void) | null = null

// eslint-disable-next-line no-unused-vars
const openSheet = (title: string, options: string[], activeIndex: number, callback: (index: number) => void) => {
  sheetTitle.value = title
  sheetOptions.value = options
  activeSheetIndex.value = activeIndex
  sheetCallback = callback
  sheetVisible.value = true
}

const closeSheet = () => {
  sheetVisible.value = false
  sheetCallback = null
}

const onSheetMaskTap = () => {
  closeSheet()
}

const onSheetSelect = (idx: number) => {
  activeSheetIndex.value = idx
  if (sheetCallback) {
    sheetCallback(idx)
  }
  closeSheet()
}

const featuredItem = ref<DisplayGroup>({
  _id: '',
  title: '豪华卡座拼桌中',
  time: '22:00',
  barName: 'Master Room',
  people: '6人',
  avatars: ['/static/default-avatar.png']
})

const onCardTap = (item?: DisplayGroup) => {
  if (item?._id) {
    uni.navigateTo({ url: `/pages/hall-detail/index?id=${item._id}` })
  } else {
    uni.navigateTo({ url: '/pages/hall-detail/index' })
  }
}

const onPublish = () => {
  uni.navigateTo({ url: '/pages/hall-create/index' })
}

const onSettings = () => {
  showToast({ title: '设置功能开发中', icon: 'none' })
}

const onFilterBar = () => {
  const bars = ['全部', ...barList.value.map((b) => b.name)]
  let activeIdx = 0
  if (filters.value.barId) {
    const barIdx = barList.value.findIndex((b) => b.id === filters.value.barId)
    if (barIdx >= 0) activeIdx = barIdx + 1
  }
  openSheet('选择酒吧', bars, activeIdx, (idx) => {
    if (idx === 0) {
      filters.value.barId = ''
      filters.value.barName = '选择酒吧'
    } else {
      const bar = barList.value[idx - 1]
      filters.value.barId = bar.id
      filters.value.barName = bar.name
    }
    fetchGroupList(true)
  })
}

const onFilterPackage = () => {
  const activeIdx = Math.max(0, packageOptions.findIndex((o) => o === filters.value.packageTypeName))
  openSheet('套餐类型', packageOptions, activeIdx, (idx) => {
    const val = packageOptions[idx]
    if (val === '全部') {
      filters.value.packageType = ''
      filters.value.packageTypeName = '套餐类型'
    } else {
      filters.value.packageType = val
      filters.value.packageTypeName = val
    }
    fetchGroupList(true)
  })
}

const onFilterPeople = () => {
  const activeIdx = Math.max(0, peopleOptions.findIndex((o) => o === filters.value.peopleName))
  openSheet('人数限制', peopleOptions, activeIdx, (idx) => {
    const val = peopleOptions[idx]
    if (val === '全部') {
      filters.value.people = ''
      filters.value.peopleName = '人数限制'
    } else {
      filters.value.people = val
      filters.value.peopleName = val
    }
    fetchGroupList(true)
  })
}

const onFilterTime = () => {
  const today = new Date()
  const format = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const dates = ['', format(today), format(new Date(today.getTime() + 86400000)), format(new Date(today.getTime() + 172800000))]
  let activeIdx = 0
  if (filters.value.date) {
    const dIdx = dates.findIndex((d) => d === filters.value.date)
    if (dIdx >= 0) activeIdx = dIdx
  }
  openSheet('预定时间', dateOptions, activeIdx, (idx) => {
    if (idx === 0) {
      filters.value.date = ''
      filters.value.dateName = '预定时间'
    } else {
      filters.value.date = dates[idx]
      filters.value.dateName = dateOptions[idx]
    }
    fetchGroupList(true)
  })
}

const navAvatarError = () => {
  navAvatar.value = '/static/default-avatar.png'
}

const refreshNavAvatar = async () => {
  const url = userStore.userInfo?.avatar
  navAvatar.value = url ? await resolveCloudAvatar(url) : '/static/default-avatar.png'
}

const onLoadMore = () => {
  if (loading.value || noMore.value) return
  page.value++
  fetchGroupList()
}

onShow(() => {
  refreshNavAvatar()
})

onMounted(() => {
  initSystemInfo()
  fetchBarList()
  fetchGroupList(true)
})
</script>

<style lang="scss" scoped>

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

.filter-item.active {
  border-color: rgba($primary, 0.4);
  background: rgba($primary, 0.08);
}

.filter-item.active .filter-label {
  color: $primary;
}

.filter-arrow {
  font-size: 20rpx;
  color: $primary;
}

/* Loading / Empty / No More */
.loading, .no-more {
  text-align: center;
  padding: 40rpx;
  color: $text-secondary;
  font-size: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  color: rgba($outline-variant, 0.3);
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
  line-height: 1.6;
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

/* Bottom Sheet */
.sheet-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.7);
  animation: fadeIn 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.sheet-container {
  background: $bg-secondary;
  border-radius: $border-radius-xl $border-radius-xl 0 0;
  padding: $spacing-lg $spacing-lg calc($spacing-lg + env(safe-area-inset-bottom));
  animation: slideUp 0.25s ease;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.sheet-title {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
}

.sheet-close {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-lg;
  color: $text-secondary;
}

.sheet-body {
  display: flex;
  flex-direction: column;
  max-height: 600rpx;
  overflow-y: auto;
}

.sheet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  transition: background $transition-fast;

  &.active {
    background: rgba($primary, 0.1);
  }

  &:active {
    background: $bg-hover;
  }
}

.sheet-item-text {
  font-size: $font-md;
  color: $text-secondary;

  .active & {
    color: $primary;
    font-weight: bold;
  }
}

.sheet-item-check {
  font-size: $font-md;
  color: $primary;
}

.sheet-footer {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1rpx solid $border-color;
}

.sheet-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: $border-radius-full;
  background: $bg-card;
  color: $text-secondary;
  font-size: $font-md;
  font-weight: 600;

  &:active {
    background: $bg-hover;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
