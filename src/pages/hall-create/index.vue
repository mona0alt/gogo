<template>
  <app-modal />
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
            :value="form.title"
            class="form-input"
            type="text"
            placeholder="请输入"
            placeholder-class="placeholder"
            @input="onTitleInput"
          />
        </view>

        <!-- Grid Fields -->
        <view class="form-grid">
          <view class="form-card selectable" @tap="onSelectBar">
            <text class="form-label">预约酒吧</text>
            <view class="select-row">
              <text class="select-value">{{ form.barName || '请选择' }}</text>
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
              <text class="select-value">{{ form.date || '请选择' }}</text>
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
        <view class="form-card size-card selectable" @tap="onSelectSize">
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
      <view class="submit-btn" :class="{ disabled: submitting }" @tap="onSubmit">
        <text class="submit-text">{{ submitting ? '发布中...' : '开启拼团' }}</text>
        <text v-if="!submitting" class="submit-icon">⚡</text>
      </view>
    </view>

    <!-- Bottom Sheet -->
    <view v-if="sheetVisible" class="sheet-mask" @tap="closeSheet">
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
import AppModal from '@/components/app-modal/index.vue'
import { showToast, showModal } from '@/utils/feedback'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { groupApi, barApi } from '@/api/index'
import { ROUTES } from '@/constants/routes'

const userStore = useUserStore()
const submitting = ref(false)

const form = ref({
  title: '',
  barId: '',
  barName: '',
  packageType: '畅饮套餐',
  date: '',
  startTime: '',
  endTime: '',
  groupType: '多人',
  size: '3男3女'
})

const onTitleInput = (e: any) => {
  form.value.title = e.detail?.value ?? ''
}

const barList = ref<{ id: string; name: string }[]>([])

const fetchBarList = async () => {
  try {
    const res = await barApi.getList({ page: 1, pageSize: 100 })
    barList.value = res.list.map((b) => ({ id: b.id, name: b.name }))
  } catch {
    // ignore
  }
}

// Bottom Sheet
const sheetVisible = ref(false)
const sheetTitle = ref('')
const sheetOptions = ref<string[]>([])
const activeSheetIndex = ref(-1)
// eslint-disable-next-line no-unused-vars
let sheetCallback: ((_idx: number) => void) | null = null

// eslint-disable-next-line no-unused-vars
const openSheet = (title: string, options: string[], activeIdx: number, callback: (_idx: number) => void) => {
  sheetTitle.value = title
  sheetOptions.value = options
  activeSheetIndex.value = activeIdx
  sheetCallback = callback
  sheetVisible.value = true
}

const closeSheet = () => {
  sheetVisible.value = false
  sheetCallback = null
}

const onSheetSelect = (idx: number) => {
  activeSheetIndex.value = idx
  if (sheetCallback) {
    sheetCallback(idx)
  }
  closeSheet()
}

const packageOptions = ['畅饮套餐', '酒水套餐', '小吃套餐', 'VIP套餐']
const groupTypeOptions = ['多人', '纯男', '纯女']
const sizeOptions = ['2人', '3男3女', '4男4女', '5男5女', '8人+']

onMounted(() => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  fetchBarList()
})

const onBack = () => {
  uni.navigateBack()
}

const onSelectBar = () => {
  const bars = barList.value.map((b) => b.name)
  if (bars.length === 0) {
    showToast({ title: '暂无酒吧数据', icon: 'none' })
    return
  }
  let activeIdx = -1
  if (form.value.barId) {
    const idx = barList.value.findIndex((b) => b.id === form.value.barId)
    if (idx >= 0) activeIdx = idx
  }
  openSheet('选择酒吧', bars, activeIdx, (idx) => {
    const bar = barList.value[idx]
    form.value.barId = bar.id
    form.value.barName = bar.name
  })
}

const onSelectPackage = () => {
  const activeIdx = Math.max(0, packageOptions.findIndex((o) => o === form.value.packageType))
  openSheet('套餐类型', packageOptions, activeIdx, (idx) => {
    form.value.packageType = packageOptions[idx]
  })
}

const onSelectTime = () => {
  const today = new Date()
  const format = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const dates = [format(today), format(new Date(today.getTime() + 86400000)), format(new Date(today.getTime() + 172800000))]
  const labels = dates.map((d) => {
    const mm = d.slice(5, 7)
    const dd = d.slice(8, 10)
    return `${mm}月${dd}日`
  })
  let activeIdx = -1
  if (form.value.date) {
    const idx = dates.findIndex((d) => d === form.value.date)
    if (idx >= 0) activeIdx = idx
  }
  openSheet('预约时间', labels, activeIdx, (idx) => {
    form.value.date = dates[idx]
  })
}

const onSelectType = () => {
  const activeIdx = Math.max(0, groupTypeOptions.findIndex((o) => o === form.value.groupType))
  openSheet('拼团类型', groupTypeOptions, activeIdx, (idx) => {
    form.value.groupType = groupTypeOptions[idx]
  })
}

const onSelectSize = () => {
  const activeIdx = Math.max(0, sizeOptions.findIndex((o) => o === form.value.size))
  openSheet('拼团人数', sizeOptions, activeIdx, (idx) => {
    form.value.size = sizeOptions[idx]
  })
}

const onSubmit = async () => {
  const title = form.value.title.trim()
  if (!title) {
    showToast({ title: '请输入拼团标题', icon: 'none' })
    return
  }
  if (!form.value.barId) {
    showToast({ title: '请选择预约酒吧', icon: 'none' })
    return
  }
  if (!form.value.date) {
    showToast({ title: '请选择预约时间', icon: 'none' })
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    await groupApi.create({
      title,
      barId: form.value.barId,
      barName: form.value.barName,
      packageType: form.value.packageType,
      date: form.value.date,
      startTime: form.value.startTime || '20:00',
      endTime: form.value.endTime || '23:00',
      targetGender: 0,
      people: form.value.size,
    })
    showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  } catch (e: any) {
    const msg = e.message || '发布失败'
    if (msg.includes('进行中的拼团')) {
      const { confirm } = await showModal({
        title: '已有进行中的拼团',
        content: msg,
        showCancel: true,
        cancelText: '取消',
        confirmText: '去查看',
      })
      if (confirm) {
        uni.navigateTo({ url: ROUTES.GROUP_STATUS })
      }
    } else {
      showToast({ title: msg, icon: 'none' })
    }
  } finally {
    submitting.value = false
  }
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

.submit-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
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