<template>
  <view class="product-card" @tap="handleTap">
    <image class="image" :src="getImageUrl()" mode="aspectFill" />
    <view class="info">
      <text class="name text-ellipsis">{{ product.name || '' }}</text>
      <view class="price-row">
        <text class="price">¥{{ product.price || 0 }}</text>
        <text v-if="product.originalPrice && product.originalPrice > product.price" class="original">¥{{ product.originalPrice }}</text>
      </view>
    </view>
    <view class="add-btn" @tap.stop="handleAddToCart"><text>+</text></view>
  </view>
</template>

<script setup lang="ts">
interface Product {
  id?: string
  name?: string
  price: number
  originalPrice?: number
  image?: string
  [key: string]: any
}

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  'add-to-cart': [product: Product]
}>()

const getImageUrl = (): string => {
  const img = props.product.image
  return img && img.length > 0 ? img : '/static/default-product.png'
}

const handleTap = () => {
  const id = props.product.id
  if (id) {
    uni.navigateTo({ url: `/pages/product-detail/index?id=${id}` })
  }
}

const handleAddToCart = () => {
  emit('add-to-cart', props.product)
}
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
  .price { color: $primary; font-size: $font-md; font-weight: bold; }
  .original { color: $text-secondary; font-size: $font-xs; text-decoration: line-through; }
  .add-btn { position: absolute; right: $spacing-sm; bottom: $spacing-sm; width: 28px; height: 28px; background: $gradient-neon; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: $on-primary; font-size: 18px; font-weight: bold; box-shadow: $shadow-neon-pink; }
}
</style>
