<script setup lang="ts">
import { useFeedbackStore } from '@/stores/feedback'

const store = useFeedbackStore()
</script>

<template>
  <view v-show="store.toast.visible" class="toast">
    <view class="toast__box">
      <view v-if="store.toast.icon === 'success'" class="toast__icon">
        <view class="toast__check" />
      </view>
      <text class="toast__text">{{ store.toast.title }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.toast {
  &[hidden] { display: none !important; }
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: fadeIn 0.2s ease;

  &__box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    max-width: 240px;
    padding: $spacing-md $spacing-lg;
    background-color: $bg-card;
    border-radius: $border-radius-md;
    box-shadow: $shadow-card;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba($status-success, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-sm;
  }

  &__check {
    width: 18px;
    height: 9px;
    border-left: 3px solid $status-success;
    border-bottom: 3px solid $status-success;
    transform: rotate(-45deg) translate(1px, -1px);
  }

  &__text {
    font-size: $font-md;
    color: $text-primary;
    text-align: center;
    line-height: 1.4;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
