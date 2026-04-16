<template>
  <view class="page">
    <view class="search-bar">
      <view class="search-input" @tap="goToSearch">
        <text class="icon">🔍</text>
        <text class="placeholder">搜索酒吧名称</text>
      </view>
    </view>
    <scroll-view class="categories" scroll-x>
      <view v-for="cat in categories" :key="cat.id" class="category-item" :class="{ active: selectedCategory === cat.id }" @tap="selectCategory(cat.id)">
        {{ cat.name }}
      </view>
    </scroll-view>
    <scroll-view class="bar-list" scroll-y @scrolltolower="loadMore">
      <view class="list-content">
        <bar-card v-for="bar in barList" :key="bar.id" :bar="bar" />
      </view>
      <view class="loading" v-if="loading"><text>加载中...</text></view>
      <view class="no-more" v-if="noMore && barList.length > 0"><text>没有更多了</text></view>
      <view class="empty" v-if="!loading && barList.length === 0"><text>暂无酒吧</text></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBarStore } from '@/stores/bar'
import barCard from '@/components/bar-card/index.vue'

const barStore = useBarStore()
const categories = ref([
  { id: '', name: '全部' },
  { id: '1', name: '精酿啤酒' },
  { id: '2', name: '鸡尾酒' },
  { id: '3', name: '威士忌' },
  { id: '4', name: '洋酒' },
  { id: '5', name: '清吧' }
])
const selectedCategory = ref('')
const loading = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = 10

const selectCategory = (id) => {
  selectedCategory.value = id
  barStore.setFilter('category', id)
  refreshList()
}

const loadMore = async () => {
  if (loading.value || noMore.value) return
  page.value++
  await fetchList()
}

const refreshList = async () => {
  page.value = 1
  noMore.value = false
  await fetchList()
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await barStore.fetchBarList({
      page: page.value,
      pageSize,
      category: selectedCategory.value
    })
    if (page.value === 1) {
      barStore.barList = data.list
    } else {
      barStore.barList.push(...data.list)
    }
    if (data.list.length < pageSize) { noMore.value = true }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goToSearch = () => { uni.navigateTo({ url: '/pages/search/index' }) }

onMounted(() => { fetchList() })
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background-color: $bg-primary; }
.search-bar { padding: $spacing-md; background-color: $bg-primary; }
.search-input { display: flex; align-items: center; height: 40px; padding: 0 $spacing-md; background-color: $bg-secondary; border-radius: 20px; }
.search-input .icon { margin-right: $spacing-sm; font-size: 14px; }
.search-input .placeholder { color: $text-secondary; font-size: $font-sm; }
.categories { white-space: nowrap; padding: 0 $spacing-md $spacing-md; }
.category-item { display: inline-block; padding: $spacing-sm $spacing-lg; margin-right: $spacing-sm; background-color: $bg-secondary; border-radius: $border-radius-full; color: $text-secondary; font-size: $font-sm; }
.category-item.active { background: $gradient-neon; color: white; }
.bar-list { height: calc(100vh - 180px); }
.list-content { padding: 0 $spacing-md; }
.loading, .no-more, .empty { text-align: center; padding: $spacing-lg; color: $text-secondary; font-size: $font-sm; }
</style>
