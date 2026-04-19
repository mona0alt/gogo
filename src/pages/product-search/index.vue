<template>
  <view class="page">
    <view class="search-bar">
      <input v-model="keyword" class="search-input" placeholder="搜索商品名称" @confirm="search" />
      <text class="cancel" @tap="goBack">取消</text>
    </view>
    <scroll-view class="results" scroll-y v-if="products.length > 0">
      <view class="product-list">
        <product-card v-for="product in products" :key="product.id" :product="product" @add-to-cart="handleAddToCart" />
      </view>
    </scroll-view>
    <view class="empty" v-else-if="searched">
      <text>未找到相关商品</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getProductList } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import productCard from '@/components/product-card/index.vue'

const cartStore = useCartStore()
const keyword = ref('')
const products = ref([])
const searched = ref(false)

const search = async () => {
  if (!keyword.value.trim()) return
  searched.value = true
  try {
    const data = await getProductList('all', { keyword: keyword.value })
    products.value = data?.list || []
  } catch (e) {
    uni.showToast({ title: '搜索失败', icon: 'none' })
  }
}

const handleAddToCart = async (product) => {
  try {
    await cartStore.addItem(product, 1)
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '加入失败', icon: 'none' })
  }
}

const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; }
.search-bar { display: flex; align-items: center; padding: $spacing-md; background-color: $bg-secondary; }
.search-input { flex: 1; height: 36px; padding: 0 $spacing-md; background-color: $bg-primary; border-radius: 18px; }
.cancel { margin-left: $spacing-md; color: $primary; }
.results { height: calc(100vh - 60px); }
.product-list { display: grid; grid-template-columns: 1fr 1fr; gap: $spacing-md; padding: $spacing-md; }
.empty { display: flex; align-items: center; justify-content: center; height: 50vh; color: $text-secondary; }
</style>