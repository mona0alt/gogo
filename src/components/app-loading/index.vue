<script setup lang="ts">
import { useFeedbackStore } from '@/stores/feedback'

const store = useFeedbackStore()
</script>

<template>
  <view v-show="store.loading.visible" class="loading" :class="{ 'loading--mask': store.loading.mask }">
    <view class="loading__box">
      <view class="loading__spinner" />
      <text v-if="store.loading.title" class="loading__text">{{ store.loading.title }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.loading {
  &[hidden] { display: none !important; }
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9997;
  display: flex;
  align-items: center;
  justify-content: center;

  &--mask {
    background-color: rgba(0, 0, 0, 0.6);
  }

  &__box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    padding: $spacing-lg;
    background-color: $bg-card;
    border-radius: $border-radius-md;
    box-shadow: $shadow-card;
  }

  &__spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba($primary, 0.2);
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: $spacing-sm;
  }

  &__text {
    font-size: $font-sm;
    color: $text-secondary;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
