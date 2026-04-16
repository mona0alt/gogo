<template>
  <view class="page">
    <view class="status-section" :class="`status--${order?.status}`">
      <text class="status-icon">{{ statusIcon }}</text>
      <text class="status-text">{{ statusText }}</text>
    </view>
    <view class="section bar-section">
      <text class="bar-name">{{ order?.barName }}</text>
      <text class="bar-address">{{ order?.barAddress }}</text>
    </view>
    <view class="section items-section">
      <view class="item" v-for="item in order?.items" :key="item.id">
        <image class="img" :src="item.productImage" mode="aspectFill" />
        <view class="info"><text class="name">{{ item.productName }}</text><text class="specs" v-if="item.specs">{{ item.specs }}</text></view>
        <view class="right"><text class="price">¥{{ item.price }}</text><text class="qty">x{{ item.quantity }}</text></view>
      </view>
    </view>
    <view class="section info-section">
      <view class="row"><text class="label">订单编号</text><text class="value">{{ order?.orderNo }}</text></view>
      <view class="row"><text class="label">下单时间</text><text class="value">{{ formatDateTime(order?.createTime) }}</text></view>
      <view class="row" v-if="order?.payTime"><text class="label">支付时间</text><text class="value">{{ formatDateTime(order?.payTime) }}</text></view>
    </view>
    <view class="section amount-section">
      <view class="row"><text class="label">商品金额</text><text class="value">¥{{ order?.totalAmount }}</text></view>
      <view class="row" v-if="order?.discountAmount > 0"><text class="label">优惠金额</text><text class="value discount">-¥{{ order?.discountAmount }}</text></view>
      <view class="row total"><text class="label">实付金额</text><text class="value">¥{{ order?.payAmount }}</text></view>
    </view>
    <view class="bottom-bar" v-if="showActions">
      <button class="btn btn--secondary" v-if="order?.status === 'pending_payment'" @tap="handleCancel">取消订单</button>
      <button class="btn btn--primary" v-if="order?.status === 'pending_payment'" @tap="handlePay">去支付</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()
const order = computed(() => orderStore.currentOrder)

const statusMap = {
  pending_payment: { text: '待付款', icon: '⏰' },
  pending_use: { text: '待使用', icon: '📋' },
  in_use: { text: '使用中', icon: '🍺' },
  completed: { text: '已完成', icon: '✅' },
  cancelled: { text: '已取消', icon: '❌' },
  refunding: { text: '售后中', icon: '🔄' }
}

const statusText = computed(() => statusMap[order.value?.status]?.text || '')
const statusIcon = computed(() => statusMap[order.value?.status]?.icon || '')
const showActions = computed(() => { return ['pending_payment'].includes(order.value?.status) })

const formatDateTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const handleCancel = async () => {
  uni.showModal({ title: '确认取消', content: '确定要取消该订单吗？', success: async (res) => { if (res.confirm) { await orderStore.cancelOrderById(order.value.id); uni.showToast({ title: '已取消', icon: 'success' }) } } })
}
const handlePay = () => {}

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id
  if (id) { await orderStore.fetchOrderDetail(id) }
})
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; padding-bottom: 100px; }
.status-section { display: flex; flex-direction: column; align-items: center; padding: $spacing-xl; background: $gradient-neon; }
.status-section .status-icon { font-size: 48px; margin-bottom: $spacing-md; }
.status-section .status-text { color: white; font-size: $font-xl; font-weight: bold; }
.section { background-color: $bg-secondary; margin-bottom: $spacing-md; padding: $spacing-md; }
.bar-section { display: flex; flex-direction: column; }
.bar-section .bar-name { color: $text-primary; font-size: $font-lg; font-weight: bold; }
.bar-section .bar-address { color: $text-secondary; font-size: $font-sm; margin-top: $spacing-xs; }
.items-section .item { display: flex; align-items: center; padding: $spacing-sm 0; border-bottom: 1px solid $border-color; }
.items-section .item:last-child { border-bottom: none; }
.items-section .item .img { width: 48px; height: 48px; border-radius: $border-radius-sm; margin-right: $spacing-md; }
.items-section .item .info { flex: 1; }
.items-section .item .info .name { color: $text-primary; font-size: $font-md; display: block; }
.items-section .item .info .specs { color: $text-secondary; font-size: $font-xs; display: block; }
.items-section .item .right { text-align: right; }
.items-section .item .right .price { color: $text-primary; display: block; }
.items-section .item .right .qty { color: $text-secondary; font-size: $font-sm; display: block; }
.info-section .row { display: flex; justify-content: space-between; padding: $spacing-sm 0; }
.info-section .row .label { color: $text-secondary; font-size: $font-sm; }
.info-section .row .value { color: $text-primary; font-size: $font-sm; }
.amount-section .row { display: flex; justify-content: space-between; padding: $spacing-sm 0; }
.amount-section .row .label { color: $text-secondary; font-size: $font-sm; }
.amount-section .row .value { color: $text-primary; font-size: $font-sm; }
.amount-section .row .discount { color: $neon-blue; }
.amount-section .row.total { border-top: 1px solid $border-color; padding-top: $spacing-md; margin-top: $spacing-sm; }
.amount-section .row.total .label, .amount-section .row.total .value { color: $text-primary; font-size: $font-lg; font-weight: bold; }
.amount-section .row.total .value { color: $neon-pink; font-size: $font-xxl; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: flex-end; gap: $spacing-md; padding: $spacing-md; padding-bottom: calc(#{$spacing-md} + constant(safe-area-inset-bottom)); background-color: $bg-secondary; border-top: 1px solid $border-color; }
.bottom-bar .btn { height: 40px; padding: 0 $spacing-lg; }
</style>
