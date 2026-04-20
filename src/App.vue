<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import AppModal from '@/components/app-modal/index.vue'
import AppToast from '@/components/app-toast/index.vue'
import AppLoading from '@/components/app-loading/index.vue'

onLaunch(() => {
  console.log('App Launch')
  // 检测登录状态，未登录跳转登录页
  const userInfo = uni.getStorageSync('userInfo')
  if (!userInfo) {
    uni.reLaunch({ url: '/pages/login/index' })
  }
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<template>
  <app-modal />
  <app-toast />
  <app-loading />
</template>

<style lang="scss">
@use '@/styles/common.scss' as *;
</style>
