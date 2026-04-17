<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
onLaunch(() => {
  console.log('App Launch')
  // 检测登录状态，未登录跳转登录页
  const token = uni.getStorageSync('token')
  const userId = uni.getStorageSync('userId')
  if (!token || !userId) {
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
<style lang="scss">
@import '@/styles/common.scss';
</style>
