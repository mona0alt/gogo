<template>
  <view class="page">
    <view class="bar-header" v-if="currentBar">
      <view class="bar-info">
        <text class="name">{{ currentBar.name }}</text>
        <text class="switch" @tap="switchBar">切换</text>
      </view>
      <view class="search-row">
        <view class="search-input" @tap="goToProductSearch">
          <text class="icon">🔍</text>
          <text class="placeholder">搜索商品</text>
        </view>
      </view>
    </view>
    <view class="no-bar" v-else>
      <text>请先选择酒吧</text>
      <button class="btn btn--primary" @tap="goToHome">去选择</button>
    </view>
    <view class="content" v-if="currentBar">
      <scroll-view class="categories" scroll-y>
        <view v-for="cat in categories" :key="cat.id" class="category-item" :class="{ active: selectedCategory === cat.id }" @tap="selectCategory(cat.id)">
          {{ cat.name }}
        </view>
      </scroll-view>
      <scroll-view class="products" scroll-y @scrolltolower="loadMore">
        <view class="product-grid">
          <product-card v-for="product in productList" :key="product.id" :product="product" @add-to-cart="handleAddToCart" />
        </view>
        <view class="loading" v-if="loading"><text>加载中...</text></view>
      </scroll-view>
    </view>
    <view class="cart-float" v-if="cartStore.totalQuantity > 0" @tap="goToCart">
      <view class="cart-icon"><text>🛒</text><text class="badge">{{ cartStore.totalQuantity }}</text></view>
      <view class="cart-info"><text class="amount">¥{{ cartStore.totalAmount }}</text></view>
      <button class="btn btn--primary">去结算</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBarStore } from '@/stores/bar'
import { useCartStore } from '@/stores/cart'
import { getCategories, getProductList } from '@/api/product'
import productCard from '@/components/product-card/index.vue'

// tabBar 页面缓存后 onMounted 不会再次触发，用 onShow 补充加载
let onShowHook = null

const barStore = useBarStore()
const cartStore = useCartStore()
const currentBar = computed(() => barStore.currentBar)
const categories = ref([])
const selectedCategory = ref('')
const productList = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = 20
const noMore = ref(false)

const selectCategory = (id) => {
  selectedCategory.value = id
  productList.value = []
  page.value = 1
  noMore.value = false
  fetchProducts()
}

const loadMore = async () => {
  if (loading.value || noMore.value) return
  page.value++
  await fetchProducts()
}

const fetchProducts = async () => {
  if (!currentBar.value || !currentBar.value.id) return
  loading.value = true
  try {
    const data = await getProductList(currentBar.value.id, { categoryId: selectedCategory.value || '', page: page.value, pageSize })
    const list = data?.list || []
    // 确保 list 每一项都有有效 id
    productList.value = list.filter(p => p.id).map(p => ({
      id: p.id,
      name: p.name || '',
      price: p.price || 0,
      image: p.image || '',
      barId: p.barId || currentBar.value.id,
      categoryId: p.categoryId || ''
    }))
    if (list.length < pageSize) { noMore.value = true }
  } catch (e) {
    console.error('Fetch products failed:', e)
    productList.value = []
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  if (!currentBar.value || !currentBar.value.id) return
  try {
    const data = await getCategories(currentBar.value.id)
    // 确保每项都有有效 id
    categories.value = (data?.list || []).filter(c => c.id).map(c => ({
      id: c.id,
      name: c.name || '',
      barId: c.barId || currentBar.value.id
    }))
    if (categories.value.length > 0 && !selectedCategory.value) {
      selectedCategory.value = categories.value[0].id
    }
  } catch (e) {
    console.error('Fetch categories failed:', e)
    categories.value = []
  }
}

const handleAddToCart = async (product) => {
  try { await cartStore.addItem(product, 1); uni.showToast({ title: '已加入购物车', icon: 'success' }) } catch (e) { uni.showToast({ title: '加入失败', icon: 'none' }) }
}

const switchBar = () => { uni.switchTab({ url: '/pages/index/index' }) }
const goToHome = () => { uni.switchTab({ url: '/pages/index/index' }) }
const goToCart = () => { uni.navigateTo({ url: '/pages/cart/index' }) }
const goToProductSearch = () => { uni.navigateTo({ url: '/pages/product-search/index' }) }

const initData = async () => {
  if (!currentBar.value) return
  await fetchCategories()
  await fetchProducts()
}

onMounted(() => {
  initData()
  // tabBar 页面被缓存后再次进入不会触发 onMounted，需通过 onShow 补充
  onShowHook = () => { initData() }
  const pages = getCurrentPages()
  const thisPage = pages[pages.length - 1]
  if (thisPage) {
    const originalOnShow = thisPage.onShow
    thisPage.onShow = function () {
      if (originalOnShow) originalOnShow.call(this)
      if (onShowHook) onShowHook()
    }
  }
})

onUnmounted(() => {
  onShowHook = null
})
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; padding-bottom: 80px; }
.bar-header { padding: $spacing-md; background-color: $bg-secondary; }
.bar-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-md; }
.bar-info .name { font-size: $font-xl; font-weight: bold; color: $text-primary; }
.bar-info .switch { color: $primary; font-size: $font-sm; }
.search-row .search-input { display: flex; align-items: center; height: 36px; padding: 0 $spacing-md; background-color: $bg-primary; border-radius: 18px; }
.search-row .search-input .icon { margin-right: $spacing-sm; font-size: 12px; }
.search-row .search-input .placeholder { color: $text-secondary; font-size: $font-sm; }
.no-bar { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; }
.no-bar text { color: $text-secondary; margin-bottom: $spacing-lg; }
.content { display: flex; height: calc(100vh - 200px); }
.categories { width: 80px; background-color: $bg-secondary; }
.categories .category-item { padding: $spacing-md; text-align: center; color: $text-secondary; font-size: $font-sm; border-left: 3px solid transparent; }
.categories .category-item.active { background-color: $bg-primary; color: $primary; border-left-color: $primary; }
.products { flex: 1; padding: $spacing-md; }
.products .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: $spacing-md; }
.products .loading { text-align: center; padding: $spacing-lg; color: $text-secondary; font-size: $font-sm; }
.cart-float { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; padding: $spacing-md; padding-bottom: calc(#{$spacing-md} + constant(safe-area-inset-bottom)); background-color: $bg-secondary; }
.cart-float .cart-icon { position: relative; font-size: 24px; margin-right: $spacing-md; }
.cart-float .cart-icon .badge { position: absolute; top: -8px; right: -8px; min-width: 16px; height: 16px; background-color: $primary; border-radius: 8px; font-size: 10px; color: $on-primary; display: flex; align-items: center; justify-content: center; }
.cart-float .cart-info { flex: 1; }
.cart-float .cart-info .amount { color: $primary; font-size: $font-xl; font-weight: bold; }
.cart-float .btn { height: 40px; padding: 0 $spacing-lg; }
</style>
