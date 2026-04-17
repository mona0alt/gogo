<template>
  <view class="page">
    <view class="header">
      <text class="title">购物车</text>
      <text class="clear" @tap="clearCart" v-if="cartStore.items.length > 0">清空</text>
    </view>
    <scroll-view class="cart-list" scroll-y v-if="cartStore.items.length > 0">
      <cart-item
        v-for="item in cartStore.items"
        :key="item.id"
        :item="item"
        @update-quantity="handleUpdateQuantity"
        @remove="handleRemove"
      />
    </scroll-view>
    <view class="empty" v-else>
      <text>购物车是空的</text>
      <button class="btn btn--primary" @tap="goToOrder">去点单</button>
    </view>
    <view class="footer" v-if="cartStore.items.length > 0">
      <view class="total">
        <text class="label">合计：</text>
        <text class="amount">¥{{ cartStore.totalAmount }}</text>
      </view>
      <button class="btn btn--primary" @tap="checkout">去结算</button>
    </view>
  </view>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import cartItem from '@/components/cart-item/index.vue'

const cartStore = useCartStore()

const handleUpdateQuantity = async (itemId, quantity) => {
  try {
    await cartStore.updateQuantity(itemId, quantity)
  } catch (e) {
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

const handleRemove = async (itemId) => {
  try {
    await cartStore.removeItem(itemId)
  } catch (e) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

const clearCart = async () => {
  try {
    await cartStore.clearCart()
  } catch (e) {
    uni.showToast({ title: '清空失败', icon: 'none' })
  }
}

const goToOrder = () => uni.switchTab({ url: '/pages/order/index' })
const checkout = () => uni.navigateTo({ url: '/pages/checkout/index' })
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; display: flex; flex-direction: column; }
.header { display: flex; justify-content: space-between; align-items: center; padding: $spacing-md; border-bottom: 1px solid $border-color; }
.header .title { font-size: $font-xl; font-weight: bold; }
.header .clear { color: $neon-pink; }
.cart-list { flex: 1; padding: $spacing-md; }
.empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.empty text { color: $text-secondary; margin-bottom: $spacing-lg; }
.footer { display: flex; align-items: center; justify-content: space-between; padding: $spacing-md; background-color: $bg-secondary; border-top: 1px solid $border-color; }
.footer .total .label { color: $text-secondary; }
.footer .total .amount { color: $neon-pink; font-size: $font-xl; font-weight: bold; margin-left: $spacing-sm; }
.footer .btn { height: 40px; padding: 0 $spacing-xl; }
</style>