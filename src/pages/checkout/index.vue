<template>
  <view class="page">
    <view class="section bar-section">
      <view class="bar-info"><text class="name">{{ currentBar?.name }}</text><text class="address">{{ currentBar?.address }}</text></view>
    </view>
    <view class="section items-section">
      <view class="section-title">商品清单</view>
      <view class="item" v-for="item in safeCheckedItems" :key="item.id">
        <image class="img" :src="item.productImage" mode="aspectFill" />
        <view class="info"><text class="name">{{ item.productName }}</text><text class="specs" v-if="item.specs">{{ item.specs }}</text></view>
        <view class="right"><text class="price">¥{{ item.price }}</text><text class="qty">x{{ item.quantity }}</text></view>
      </view>
    </view>
    <view class="section coupon-section" @tap="showCouponPicker">
      <view class="label">优惠券</view>
      <view class="value"><text v-if="selectedCoupon">-¥{{ selectedCoupon.amount }}</text><text v-else class="placeholder">暂无可用</text><text class="arrow">›</text></view>
    </view>
    <view class="section amount-section">
      <view class="row"><text class="label">商品金额</text><text class="value">¥{{ totalAmount }}</text></view>
      <view class="row" v-if="discountAmount > 0"><text class="label">优惠金额</text><text class="value discount">-¥{{ discountAmount }}</text></view>
      <view class="row total"><text class="label">实付金额</text><text class="value">¥{{ payAmount }}</text></view>
    </view>
    <view class="bottom-bar">
      <view class="total"><text class="label">合计:</text><text class="amount">¥{{ payAmount }}</text></view>
      <button class="btn btn--primary" :loading="submitting" @tap="handleSubmit">提交订单</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useBarStore } from '@/stores/bar'
import { useOrderStore } from '@/stores/order'
import { getWxPayParams } from '@/api/order'

const cartStore = useCartStore()
const barStore = useBarStore()
const orderStore = useOrderStore()
const currentBar = computed(() => barStore.currentBar)
const submitting = ref(false)
const selectedCoupon = ref(null)

const safeCheckedItems = computed(() => cartStore.checkedCartItems || [])

const totalAmount = computed(() => (cartStore.checkedCartItems || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0))
const discountAmount = computed(() => selectedCoupon.value ? selectedCoupon.value.amount : 0)
const payAmount = computed(() => Math.max(0, totalAmount.value - discountAmount.value))

const showCouponPicker = () => { uni.showToast({ title: '暂未开放', icon: 'none' }) }

const handleSubmit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    const orderData = {
      barId: currentBar.value.id,
      items: safeCheckedItems.value.map(item => ({ productId: item.productId, productName: item.productName, productImage: item.productImage, price: item.price, quantity: item.quantity, specs: item.specs })),
      totalAmount: totalAmount.value,
      discountAmount: discountAmount.value,
      payAmount: payAmount.value,
      couponId: selectedCoupon.value?.id
    }
    const order = await orderStore.createOrder(orderData)
    const payParams = await getWxPayParams(order.id)
    await new Promise((resolve, reject) => {
      uni.requestPayment({ ...payParams, success: () => resolve(), fail: (err) => reject(new Error(err.errMsg || '支付失败')) })
    })
    await cartStore.clearCart()
    uni.redirectTo({ url: `/pages/order-detail/index?id=${order.id}&status=success` })
  } catch (e) {
    console.error('Submit order failed:', e)
    uni.showToast({ title: e.message || '提交失败', icon: 'none' })
  } finally { submitting.value = false }
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; padding-bottom: 100px; }
.section { background-color: $bg-secondary; margin-bottom: $spacing-md; padding: $spacing-md; }
.bar-section .bar-info { display: flex; flex-direction: column; }
.bar-section .name { color: $text-primary; font-size: $font-lg; font-weight: bold; }
.bar-section .address { color: $text-secondary; font-size: $font-sm; margin-top: $spacing-xs; }
.section-title { color: $text-secondary; font-size: $font-sm; margin-bottom: $spacing-md; }
.item { display: flex; align-items: center; padding: $spacing-sm 0; border-bottom: 1px solid $border-color; }
.item:last-child { border-bottom: none; }
.item .img { width: 48px; height: 48px; border-radius: $border-radius-sm; margin-right: $spacing-md; }
.item .info { flex: 1; }
.item .info .name { color: $text-primary; font-size: $font-md; display: block; }
.item .info .specs { color: $text-secondary; font-size: $font-xs; display: block; margin-top: 2px; }
.item .right { text-align: right; }
.item .right .price { color: $text-primary; font-size: $font-md; display: block; }
.item .right .qty { color: $text-secondary; font-size: $font-sm; display: block; margin-top: 2px; }
.coupon-section { display: flex; justify-content: space-between; align-items: center; }
.coupon-section .label { color: $text-primary; font-size: $font-md; }
.coupon-section .value { display: flex; align-items: center; color: $primary; font-size: $font-md; }
.coupon-section .value .placeholder { color: $text-secondary; }
.coupon-section .value .arrow { margin-left: $spacing-sm; font-size: 18px; }
.amount-section .row { display: flex; justify-content: space-between; align-items: center; padding: $spacing-sm 0; }
.amount-section .row .label { color: $text-secondary; font-size: $font-sm; }
.amount-section .row .value { color: $text-primary; font-size: $font-sm; }
.amount-section .row .discount { color: $secondary-light; }
.amount-section .row.total { border-top: 1px solid $border-color; padding-top: $spacing-md; margin-top: $spacing-sm; }
.amount-section .row.total .label { color: $text-primary; font-size: $font-lg; }
.amount-section .row.total .value { color: $primary; font-size: $font-xxl; font-weight: bold; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: $spacing-md; padding-bottom: calc(#{$spacing-md} + constant(safe-area-inset-bottom)); background-color: $bg-secondary; }
.bottom-bar .total { display: flex; align-items: baseline; }
.bottom-bar .total .label { color: $text-secondary; font-size: $font-sm; margin-right: $spacing-sm; }
.bottom-bar .total .amount { color: $primary; font-size: $font-xxl; font-weight: bold; }
.bottom-bar .btn { height: 44px; padding: 0 $spacing-xl; }
</style>
