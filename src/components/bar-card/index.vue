<template>
  <view class="bar-card" @tap="goToBarDetail">
    <image class="cover" :src="bar.coverImage || '/static/default-bar.png'" mode="aspectFill" />
    <view class="content">
      <view class="header">
        <text class="name">{{ bar.name }}</text>
        <text class="tag" :class="bar.status === 'open' ? 'tag--open' : 'tag--closed'">
          {{ bar.status === 'open' ? '营业中' : '休息中' }}
        </text>
      </view>
      <view class="info">
        <text class="distance">{{ formatDistance(bar.distance) }}</text>
        <text class="separator">|</text>
        <text class="minimum">最低消费 ¥{{ bar.minimumSpend || 0 }}</text>
      </view>
      <view class="tags" v-if="displayTags.length">
        <text class="tag-small" v-for="tag in displayTags" :key="tag">{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bar: { type: Object, required: true }
})

const displayTags = computed(() => {
  if (!props.bar.tags || !Array.isArray(props.bar.tags)) return []
  return props.bar.tags.slice(0, 3)
})

const formatDistance = (distance) => {
  if (!distance) return ''
  if (typeof distance === 'number') {
    return distance < 1000 ? `${distance}m` : `${(distance / 1000).toFixed(1)}km`
  }
  return distance
}

const goToBarDetail = () => {
  uni.navigateTo({ url: `/pages/bar-detail/index?id=${props.bar.id}` })
}
</script>

<style lang="scss" scoped>
.bar-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-lg;
  overflow: hidden;
  margin-bottom: $spacing-md;

  .cover { width: 100%; height: 140px; }
  .content { padding: $spacing-md; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: $spacing-sm; }
  .name { font-size: $font-lg; font-weight: bold; color: $text-primary; }
  .info { display: flex; align-items: center; color: $text-secondary; font-size: $font-sm; margin-bottom: $spacing-sm; }
  .separator { margin: 0 $spacing-sm; }
  .tags { display: flex; gap: $spacing-xs; }
  .tag-small { padding: 2px 8px; background-color: rgba($neon-blue, 0.1); color: $neon-blue; border-radius: $border-radius-full; font-size: $font-xs; }
}
</style>
