<template>
  <view class="page">
    <swiper class="cover-swiper" :indicator-dots="true" :autoplay="true">
      <swiper-item v-for="(img, index) in bar?.images" :key="index">
        <image class="cover-image" :src="img || '/static/default-bar.png'" mode="aspectFill" />
      </swiper-item>
    </swiper>
    <view class="info-section">
      <view class="header">
        <text class="name">{{ bar?.name }}</text>
        <text class="status" :class="bar?.status === 'open' ? 'status--open' : 'status--closed'">{{ bar?.status === 'open' ? '营业中' : '休息中' }}</text>
      </view>
      <view class="info-row"><text class="icon">📍</text><text class="text">{{ bar?.address }}</text></view>
      <view class="info-row"><text class="icon">🕐</text><text class="text">{{ bar?.businessHours }}</text></view>
      <view class="info-row"><text class="icon">📞</text><text class="text" @tap="callBar">{{ bar?.phone }}</text></view>
    </view>
    <view v-if="bar?.tags?.length" class="tags-section">
      <text v-for="tag in bar.tags" :key="tag" class="tag">{{ tag }}</text>
    </view>
    <view class="actions">
      <button class="btn btn--secondary" @tap="handleStoreWine">存酒</button>
      <button class="btn btn--primary" @tap="goToOrder">点单</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBarStore } from '@/stores/bar'

const barStore = useBarStore()
const bar = ref(null)

const callBar = () => { if (bar.value?.phone) { uni.makePhoneCall({ phoneNumber: bar.value.phone }) } }
const handleStoreWine = () => { uni.navigateTo({ url: '/pages/store-wine/index' }) }
const goToOrder = () => { barStore.selectBar(bar.value); uni.switchTab({ url: '/pages/order/index' }) }

onMounted(async () => {
  const pages = getCurrentPages() || []
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id
  if (id) {
    try { bar.value = await barStore.fetchBarDetail(id) } catch { uni.showToast({ title: '加载失败', icon: 'none' }) }
  }
})
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; padding-bottom: 100px; }
.cover-swiper { height: 250px; }
.cover-swiper .cover-image { width: 100%; height: 100%; }
.info-section { padding: $spacing-md; background-color: $bg-secondary; }
.info-section .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-md; }
.info-section .name { color: $text-primary; font-size: $font-xxl; font-weight: bold; }
.info-section .status { padding: $spacing-xs $spacing-sm; border-radius: $border-radius-full; font-size: $font-xs; }
.info-section .status--open { background-color: rgba($status-open, 0.15); color: $status-open; }
.info-section .status--closed { background-color: rgba($text-secondary, 0.2); color: $text-secondary; }
.info-section .info-row { display: flex; align-items: center; margin-bottom: $spacing-sm; }
.info-section .info-row .icon { margin-right: $spacing-sm; font-size: 14px; }
.info-section .info-row .text { color: $text-secondary; font-size: $font-sm; }
.tags-section { display: flex; flex-wrap: wrap; gap: $spacing-sm; padding: $spacing-md; background-color: $bg-secondary; margin-top: $spacing-md; }
.tags-section .tag { padding: $spacing-xs $spacing-md; background-color: rgba($primary, 0.15); color: $primary; border-radius: $border-radius-full; font-size: $font-xs; }
.actions { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: $spacing-md; padding: $spacing-md; padding-bottom: calc(#{$spacing-md} + constant(safe-area-inset-bottom)); background-color: $bg-secondary; }
.actions .btn { flex: 1; height: 44px; }
</style>
