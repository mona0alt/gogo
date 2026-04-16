<template>
  <view class="page">
    <view class="status-tabs">
      <view v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: currentStatus === tab.value }" @tap="switchTab(tab.value)">{{ tab.label }}</view>
    </view>
    <scroll-view class="order-list" scroll-y @scrolltolower="loadMore">
      <order-card v-for="order in displayOrders" :key="order.id" :order="order" />
      <view class="loading" v-if="loading"><text>加载中...</text></view>
      <view class="no-more" v-if="noMore && displayOrders.length > 0"><text>没有更多了</text></view>
      <view class="empty" v-if="!loading && displayOrders.length === 0"><text class="icon">📋</text><text class="text">暂无订单</text></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import orderCard from '@/components/order-card/index.vue'

const orderStore = useOrderStore()
const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待使用', value: 'pending_use' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]
const currentStatus = ref('')
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 10

const displayOrders = computed(() => {
  if (!currentStatus.value) return orderStore.orders
  return orderStore.orders.filter(o => o.status === currentStatus.value)
})

const switchTab = async (status) => {
  currentStatus.value = status
  orderStore.setStatusFilter(status)
  page.value = 1
  noMore.value = false
  await fetchOrders()
}

const loadMore = async () => {
  if (loading.value || noMore.value) return
  page.value++
  await fetchOrders()
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const data = await orderStore.fetchOrderList({ page: page.value, pageSize, status: currentStatus.value })
    if (page.value === 1) { orderStore.orders = data.list } else { orderStore.orders.push(...data.list) }
    if (data.list.length < pageSize) { noMore.value = true }
  } catch (e) { uni.showToast({ title: '加载失败', icon: 'none' }) } finally { loading.value = false }
}

onMounted(() => { fetchOrders() })
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; }
.status-tabs { display: flex; background-color: $bg-secondary; padding: $spacing-md 0; }
.status-tabs .tab { flex: 1; text-align: center; color: $text-secondary; font-size: $font-md; padding: $spacing-sm 0; border-bottom: 2px solid transparent; }
.status-tabs .tab.active { color: $neon-pink; border-bottom-color: $neon-pink; }
.order-list { height: calc(100vh - 100px); padding: $spacing-md; }
.loading, .no-more, .empty { text-align: center; padding: $spacing-lg; color: $text-secondary; font-size: $font-sm; }
.empty { display: flex; flex-direction: column; align-items: center; padding-top: 100px; }
.empty .icon { font-size: 48px; margin-bottom: $spacing-md; }
</style>
