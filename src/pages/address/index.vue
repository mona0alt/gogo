<template>
  <view class="page">
    <view class="address-list">
      <view
        v-for="item in list"
        :key="item.id"
        class="address-card"
        @tap="handleSelect(item)"
      >
        <view class="header">
          <text class="name">{{ item.name }}</text>
          <text class="phone">{{ item.phone }}</text>
          <view v-if="item.isDefault" class="default-tag">
            <text>默认</text>
          </view>
        </view>
        <view class="address-text">
          <text>{{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}</text>
        </view>
        <view v-if="!selectMode" class="actions">
          <text class="action-btn" @tap.stop="goToEdit(item.id)">编辑</text>
          <text class="action-btn delete" @tap.stop="handleDelete(item)">删除</text>
        </view>
      </view>

      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-text">暂无收货地址</text>
      </view>
    </view>

    <view class="footer">
      <button class="btn-primary" @tap="goToEdit()">新增收货地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { addressApi } from '@/api/index'
import { ROUTES } from '@/constants/routes'
import { showModal, showToast } from '@/utils/feedback'
import type { DeliveryAddress } from '@/types/domain'

const list = ref<DeliveryAddress[]>([])
const loading = ref(false)
const selectMode = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await addressApi.getList({ pageSize: 100 })
    list.value = res.list
  } finally {
    loading.value = false
  }
}

const handleSelect = (item: DeliveryAddress) => {
  if (!selectMode.value) return
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any
  if (prevPage && prevPage.$vm) {
    prevPage.$vm.setSelectedAddress?.(item)
  }
  uni.navigateBack()
}

const goToEdit = (id?: string) => {
  uni.navigateTo({ url: ROUTES.ADDRESS_EDIT(id) })
}

const handleDelete = async (item: DeliveryAddress) => {
  const res = await showModal({
    title: '确认删除',
    content: '确定要删除该地址吗？',
  })
  if (!res.confirm) return

  try {
    await addressApi.remove(item.id)
    showToast({ title: '删除成功', icon: 'success' })
    fetchList()
  } catch {
    showToast({ title: '删除失败', icon: 'none' })
  }
}

onLoad((query) => {
  if (query?.selectMode === 'true') {
    selectMode.value = true
  }
})

onShow(() => {
  fetchList()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
  padding-bottom: 160rpx;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.address-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: $spacing-md;

  .header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;

    .name {
      font-size: $font-md;
      font-weight: 600;
      color: $text-primary;
    }

    .phone {
      font-size: $font-sm;
      color: $text-secondary;
    }

    .default-tag {
      padding: 2rpx 10rpx;
      background-color: rgba($primary, 0.1);
      border-radius: $border-radius-sm;

      text {
        font-size: 20rpx;
        color: $primary;
      }
    }
  }

  .address-text {
    font-size: $font-sm;
    color: $text-primary;
    line-height: 1.6;
    margin-bottom: $spacing-sm;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    border-top: 1px solid $border-color;
    padding-top: $spacing-sm;

    .action-btn {
      font-size: $font-sm;
      color: $text-secondary;
      padding: 4rpx 12rpx;

      &.delete {
        color: $status-error;
      }
    }
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
