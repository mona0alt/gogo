<template>
  <view class="product-card" @tap="goToProductDetail">
    <image class="image" :src="product.image || '/static/default-product.png'" mode="aspectFill" />
    <view class="info">
      <text class="name text-ellipsis">{{ product.name }}</text>
      <view class="price-row">
        <text class="price">¥{{ product.price }}</text>
        <text class="original" v-if="product.originalPrice > product.price">¥{{ product.originalPrice }}</text>
      </view>
    </view>
    <view class="add-btn" @tap.stop="handleAddToCart"><text>+</text></view>
  </view>
</template>

<script setup>
const props = defineProps({ product: { type: Object, required: true } })
const emit = defineEmits(['add-to-cart'])
const goToProductDetail = () => { uni.navigateTo({ url: `/pages/product-detail/index?id=${props.product.id}` }) }
const handleAddToCart = () => { emit('add-to-cart', props.product) }
</script>

<style lang="scss" scoped>
.product-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-md;
  overflow: hidden;
  position: relative;
  .image { width: 100%; height: 120px; }
  .info { padding: $spacing-sm; }
  .name { font-size: $font-sm; color: $text-primary; margin-bottom: $spacing-xs; display: block; }
  .price-row { display: flex; align-items: baseline; gap: $spacing-sm; }
  .price { color: $neon-pink; font-size: $font-md; font-weight: bold; }
  .original { color: $text-secondary; font-size: $font-xs; text-decoration: line-through; }
  .add-btn { position: absolute; right: $spacing-sm; bottom: $spacing-sm; width: 28px; height: 28px; background: $gradient-neon; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold; box-shadow: $shadow-neon-pink; }
}
</style>
