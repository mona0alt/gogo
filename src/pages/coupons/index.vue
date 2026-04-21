<template>
  <view class="page">
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @tap="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="coupon-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="coupon-card"
        :class="[item.status, { selectable: selectMode }]"
        @tap="handleSelect(item)"
      >
        <view class="coupon-left" :class="item.type">
          <text class="value">{{ formatValue(item) }}</text>
        </view>
        <view class="coupon-right">
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="threshold">{{ formatThreshold(item) }}</text>
            <text class="scope">{{ formatScope(item) }}</text>
            <text class="expire">{{ formatExpire(item) }}</text>
          </view>
          <view v-if="selectMode && selectedId === item.id" class="check">
            <text>✓</text>
          </view>
          <view v-else-if="item.status !== 'unused'" class="status-tag">
            <text>{{ statusLabel[item.status] }}</text>
          </view>
        </view>
      </view>

      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-text">暂无优惠券</text>
      </view>
    </view>

    <view v-if="selectMode" class="footer">
      <button class="btn-primary" @tap="confirmSelect">确认使用</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { couponApi } from '@/api/index'
import type { UserCoupon, UserCouponStatus } from '@/types/domain'

const tabs: { label: string; value: UserCouponStatus }[] = [
  { label: '未使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
]

const statusLabel: Record<UserCouponStatus, string> = {
  unused: '未使用',
  used: '已使用',
  expired: '已过期',
}

const currentTab = ref<UserCouponStatus>('unused')
const list = ref<UserCoupon[]>([])
const loading = ref(false)
const selectMode = ref(false)
const selectedId = ref('')
const selectParams = ref({ orderAmount: 0, barId: '' })

const formatValue = (item: UserCoupon) => {
  if (item.type === 'discount') return `${item.value * 10}折`
  return `¥${item.value}`
}

const formatThreshold = (item: UserCoupon) => {
  if (item.threshold <= 0) return '无门槛'
  return `满${item.threshold}元可用`
}

const formatScope = (item: UserCoupon) => {
  if (item.scopeType === 'all') return '全场通用'
  if (item.scopeType === 'bar') return '指定酒吧可用'
  if (item.scopeType === 'category') return '指定分类可用'
  return ''
}

const formatExpire = (item: UserCoupon) => {
  if (!item.expireAt) return ''
  const date = item.expireAt.split('T')[0]
  return `有效期至 ${date}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await couponApi.getList({ status: currentTab.value, pageSize: 100 })
    if (selectMode.value && currentTab.value === 'unused') {
      list.value = res.list.filter(item => {
        if (item.status !== 'unused') return false
        if (item.threshold > selectParams.value.orderAmount) return false
        if (item.scopeType === 'bar' && item.scopeTarget && item.scopeTarget !== selectParams.value.barId) return false
        return true
      })
    } else {
      list.value = res.list
    }
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: UserCouponStatus) => {
  currentTab.value = tab
  fetchList()
}

const handleSelect = (item: UserCoupon) => {
  if (!selectMode.value || item.status !== 'unused') return
  selectedId.value = item.id
}

const confirmSelect = () => {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any
  if (prevPage && prevPage.$vm) {
    prevPage.$vm.setSelectedCoupon?.(selectedId.value)
  }
  uni.navigateBack()
}

onLoad((query) => {
  if (query?.selectMode === 'true') {
    selectMode.value = true
    selectParams.value.orderAmount = Number(query.orderAmount) || 0
    selectParams.value.barId = String(query.barId || '')
  }
  fetchList()
})

onMounted(() => {
  // uni-app onLoad 已处理
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding-bottom: 120rpx;
}

.tabs {
  display: flex;
  background-color: $bg-secondary;
  padding: 0 $spacing-md;
  margin-bottom: $spacing-md;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: $spacing-md 0;
    color: $text-secondary;
    font-size: $font-md;
    position: relative;

    &.active {
      color: $primary;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background-color: $primary;
        border-radius: 2rpx;
      }
    }
  }
}

.coupon-list {
  padding: 0 $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.coupon-card {
  display: flex;
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  overflow: hidden;

  &.selectable {
    .coupon-right {
      padding-right: $spacing-lg;
    }
  }

  &.used,
  &.expired {
    opacity: 0.6;
  }
}

.coupon-left {
  width: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba($primary, 0.1);
  padding: $spacing-md;

  &.fixed {
    background-color: rgba($secondary-light, 0.15);
  }

  &.threshold {
    background-color: rgba($primary, 0.15);
  }

  &.discount {
    background-color: rgba($status-error, 0.15);
  }

  .value {
    font-size: $font-xl;
    font-weight: 700;
    color: $primary;
  }
}

.coupon-right {
  flex: 1;
  padding: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .info {
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .name {
      font-size: $font-md;
      font-weight: 600;
      color: $text-primary;
    }

    .threshold,
    .scope,
    .expire {
      font-size: $font-sm;
      color: $text-secondary;
    }
  }

  .check {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: $primary;
    color: $on-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-sm;
  }

  .status-tag {
    padding: 4rpx 12rpx;
    background-color: $bg-primary;
    border-radius: $border-radius-sm;
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.empty {
  display: flex;
  justify-content: center;
  padding-top: 200rpx;

  .empty-text {
    color: $text-secondary;
    font-size: $font-md;
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: $bg-secondary;
  border-top: 1px solid $border-color;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background-color: $primary;
  color: $on-primary;
  border-radius: $border-radius-full;
  font-size: $font-md;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary::after {
  border: none;
}
</style>