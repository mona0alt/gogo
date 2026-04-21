<template>
  <view class="page">
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input
          v-model="form.name"
          class="input"
          placeholder="请输入收货人姓名"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">手机号</text>
        <input
          v-model="form.phone"
          class="input"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <text class="label">所在地区</text>
        <picker
          mode="region"
          :value="regionValue"
          @change="onRegionChange"
        >
          <view class="picker-value" :class="{ placeholder: !form.province }">
            {{ regionText }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <input
          v-model="form.detail"
          class="input"
          placeholder="请输入街道、楼牌号等"
          maxlength="100"
        />
      </view>

      <view class="form-item switch-item">
        <text class="label">设为默认地址</text>
        <switch
          :checked="form.isDefault"
          color="#c9a96e"
          @change="onDefaultChange"
        />
      </view>
    </view>

    <view class="footer">
      <button class="btn-primary" @tap="handleSave">保存</button>
      <button v-if="isEdit" class="btn-danger" @tap="handleDelete">删除地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addressApi } from '@/api/index'
import { showToast } from '@/utils/feedback'

const form = ref({
  id: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

const isEdit = ref(false)

const regionValue = computed(() => {
  if (!form.value.province) return []
  return [form.value.province, form.value.city, form.value.district]
})

const regionText = computed(() => {
  if (!form.value.province) return '请选择省市区'
  return `${form.value.province} ${form.value.city} ${form.value.district}`
})

const onRegionChange = (e: any) => {
  const val = e.detail?.value || []
  if (val.length >= 3) {
    form.value.province = val[0]
    form.value.city = val[1]
    form.value.district = val[2]
  }
}

const onDefaultChange = (e: any) => {
  form.value.isDefault = e.detail?.value || false
}

const validate = () => {
  if (!form.value.name.trim()) {
    showToast({ title: '请输入收货人姓名', icon: 'none' })
    return false
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(form.value.phone)) {
    showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  if (!form.value.province) {
    showToast({ title: '请选择所在地区', icon: 'none' })
    return false
  }
  if (!form.value.detail.trim()) {
    showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }
  return true
}

const handleSave = async () => {
  if (!validate()) return

  try {
    await addressApi.save({
      id: isEdit.value ? form.value.id : undefined,
      name: form.value.name.trim(),
      phone: form.value.phone,
      province: form.value.province,
      city: form.value.city,
      district: form.value.district,
      detail: form.value.detail.trim(),
      isDefault: form.value.isDefault,
    })
    showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch {
    showToast({ title: '保存失败', icon: 'none' })
  }
}

const handleDelete = async () => {
  if (!form.value.id) return
  try {
    await addressApi.remove(form.value.id)
    showToast({ title: '删除成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch {
    showToast({ title: '删除失败', icon: 'none' })
  }
}

onLoad((query) => {
  if (query?.id) {
    isEdit.value = true
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] as any
    const target = prevPage?.$vm?.list?.find((a: any) => a.id === query.id)
    if (target) {
      form.value = { ...target, id: query.id }
    }
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding-bottom: 240rpx;
}

.form {
  background-color: $bg-secondary;
  margin: $spacing-md;
  border-radius: $border-radius-xl;
  padding: 0 $spacing-md;
}

.form-item {
  display: flex;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  .label {
    width: 160rpx;
    font-size: $font-md;
    color: $text-primary;
    flex-shrink: 0;
  }

  .input {
    flex: 1;
    font-size: $font-md;
    color: $text-primary;
  }

  .picker-value {
    flex: 1;
    font-size: $font-md;
    color: $text-primary;

    &.placeholder {
      color: $text-secondary;
    }
  }
}

.switch-item {
  justify-content: space-between;
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
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
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

.btn-danger {
  width: 100%;
  height: 88rpx;
  background-color: transparent;
  color: $status-error;
  border-radius: $border-radius-full;
  font-size: $font-md;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba($status-error, 0.3);
}

.btn-danger::after {
  border: none;
}
</style>