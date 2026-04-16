<template>
  <view class="order-card" @tap="goToOrderDetail">
    <view class="header">
      <text class="bar-name">{{ order.barName }}</text>
      <text class="status" :class="`status--${order.status}`">{{ statusText }}</text>
    </view>
    <view class="products">
      <image v-for="(item, index) in displayItems" :key="item.id" class="product-img" :src="item.productImage || '/static/default-product.png'" mode="aspectFill" />
      <text class="more" v-if="displayItems.length < itemCount">+{{ itemCount - displayItems.length }}</text>
    </view>
    <view class="footer">
      <text class="amount">¥{{ order.totalAmount || order.payAmount || 0 }}</text>
      <text class="time">{{ formatTime(order.createdAt || order.createTime) }}</text>
    </view>
    <view class="actions" v-if="showActions">
      <button class="btn btn--secondary" v-if="order.status === 'pending_payment'" @tap.stop="handleCancel">取消订单</button>
      <button class="btn btn--primary" v-if="order.status === 'pending_payment'" @tap.stop="handlePay">去支付</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ order: { type: Object, required: true } })
const statusMap = { pending_payment: '待付款', pending_use: '待使用', in_use: '使用中', completed: '已完成', cancelled: '已取消', refunding: '售后中' }
const statusText = computed(() => statusMap[props.order.status] || props.order.status)
const showActions = computed(() => { return ['pending_payment', 'pending_use', 'completed'].includes(props.order.status) })
const displayItems = computed(() => {
  if (!props.order.items || !Array.isArray(props.order.items)) return []
  return props.order.items.slice(0, 3)
})
const itemCount = computed(() => {
  if (!props.order.items || !Array.isArray(props.order.items)) return 0
  return props.order.items.length
})
const formatTime = (time) => { if (!time) return ''; const date = new Date(time); return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}` }
const goToOrderDetail = () => { uni.navigateTo({ url: `/pages/order-detail/index?id=${props.order.id}` }) }
const handleCancel = () => {}
const handlePay = () => {}
</script>

<style lang="scss" scoped>
.order-card { background-color: $bg-secondary; border-radius: $border-radius-lg; padding: $spacing-md; margin-bottom: $spacing-md; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-md; }
.bar-name { font-size: $font-lg; font-weight: bold; color: $text-primary; }
.status { font-size: $font-sm; }
.status--pending_payment { color: $status-warning; }
.status--pending_use { color: $neon-blue; }
.status--in_use { color: $neon-pink; }
.status--completed { color: $status-success; }
.status--cancelled { color: $text-secondary; }
.products { display: flex; gap: $spacing-sm; margin-bottom: $spacing-md; }
.product-img { width: 48px; height: 48px; border-radius: $border-radius-sm; }
.more { width: 48px; height: 48px; background-color: $bg-primary; border-radius: $border-radius-sm; display: flex; align-items: center; justify-content: center; color: $text-secondary; font-size: $font-sm; }
.footer { display: flex; justify-content: space-between; align-items: center; padding-top: $spacing-md; border-top: 1px solid $border-color; }
.amount { color: $neon-pink; font-size: $font-lg; font-weight: bold; }
.time { color: $text-secondary; font-size: $font-sm; }
.actions { display: flex; justify-content: flex-end; gap: $spacing-sm; margin-top: $spacing-md; }
.actions .btn { height: 32px; padding: 0 $spacing-md; font-size: $font-sm; border-radius: $border-radius-md; }
</style>
