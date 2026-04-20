<template>
  <view class="cart-item" :class="{ 'is-checked': isChecked }">
    <view class="check" @tap="handleToggleCheck"><text v-if="isChecked">✓</text></view>
    <image class="image" :src="item.productImage || '/static/default-product.png'" mode="aspectFill" />
    <view class="info">
      <text class="name">{{ item.productName }}</text>
      <text v-if="item.specs" class="specs">{{ item.specs }}</text>
      <view class="bottom">
        <text class="price">¥{{ item.price }}</text>
        <view class="quantity">
          <text class="btn minus" @tap="handleDecrement">-</text>
          <text class="num">{{ item.quantity }}</text>
          <text class="btn plus" @tap="handleIncrement">+</text>
        </view>
      </view>
    </view>
    <view class="delete" @tap="handleDelete"><text>×</text></view>
  </view>
</template>

<script setup lang="ts">
interface CartItem {
  id: string
  productImage?: string
  productName?: string
  specs?: string
  price: number
  quantity: number
  [key: string]: any
}

const props = defineProps<{
  item: CartItem
  isChecked?: boolean
}>()

const emit = defineEmits<{
  'toggle-check': [itemId: string]
  increment: [itemId: string, quantity: number]
  decrement: [itemId: string, quantity: number]
  delete: [itemId: string]
}>()

const handleToggleCheck = () => emit('toggle-check', props.item.id)
const handleIncrement = () => emit('increment', props.item.id, props.item.quantity + 1)
const handleDecrement = () => { if (props.item.quantity > 1) emit('decrement', props.item.id, props.item.quantity - 1) }
const handleDelete = () => emit('delete', props.item.id)
</script>

<style lang="scss" scoped>
.cart-item {
  display: flex; align-items: center; padding: $spacing-md; background-color: $bg-secondary; border-radius: $border-radius-md; margin-bottom: $spacing-sm; position: relative;
  .check { width: 20px; height: 20px; border: 1.5px solid rgba($outline-variant, 0.4); border-radius: 50%; margin-right: $spacing-md; display: flex; align-items: center; justify-content: center; font-size: 12px; color: $primary; }
  .is-checked .check { background-color: $primary; border-color: $primary; color: $on-primary; }
  .image { width: 60px; height: 60px; border-radius: $border-radius-sm; margin-right: $spacing-md; }
  .info { flex: 1; }
  .name { font-size: $font-md; color: $text-primary; display: block; margin-bottom: $spacing-xs; }
  .specs { font-size: $font-xs; color: $text-secondary; display: block; margin-bottom: $spacing-xs; }
  .bottom { display: flex; justify-content: space-between; align-items: center; }
  .price { color: $primary; font-weight: bold; }
  .quantity { display: flex; align-items: center; gap: $spacing-sm; }
  .quantity .btn { width: 24px; height: 24px; background-color: $bg-dim; border-radius: $border-radius-sm; display: flex; align-items: center; justify-content: center; font-size: 16px; color: $text-primary; }
  .quantity .num { min-width: 20px; text-align: center; color: $text-primary; }
  .delete { position: absolute; right: 0; top: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: $text-secondary; font-size: 20px; }
}
</style>
