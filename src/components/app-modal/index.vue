<script setup lang="ts">
import { useFeedbackStore } from '@/stores/feedback'

const store = useFeedbackStore()

const onMaskClick = () => {
  // eslint-disable-next-line no-console
  console.log('[app-modal] mask clicked')
  store.closeModal(false)
}

const onCancel = () => {
  // eslint-disable-next-line no-console
  console.log('[app-modal] cancel clicked')
  store.closeModal(false)
}

const onConfirm = () => {
  // eslint-disable-next-line no-console
  console.log('[app-modal] confirm clicked')
  store.closeModal(true)
}
</script>

<template>
  <view v-if="store.modal.visible" class="modal" @click="onMaskClick">
    <view class="modal__card" @click.stop>
      <view v-if="store.modal.title" class="modal__title">{{ store.modal.title }}</view>
      <view v-if="store.modal.content" class="modal__content">{{ store.modal.content }}</view>
      <view class="modal__actions">
        <view
          v-if="store.modal.showCancel"
          class="modal__btn modal__btn--cancel"
          @click="onCancel"
        >
          {{ store.modal.cancelText }}
        </view>
        <view class="modal__btn modal__btn--confirm" @click="onConfirm">
          {{ store.modal.confirmText }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  animation: fadeIn 0.2s ease;

  &__card {
    width: 280px;
    background-color: $bg-secondary;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    box-shadow: $shadow-card;
    animation: scaleIn 0.2s ease;
  }

  &__title {
    font-size: $font-lg;
    font-weight: bold;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-sm;
  }

  &__content {
    font-size: $font-md;
    color: $text-secondary;
    text-align: center;
    line-height: 1.5;
    margin-bottom: $spacing-lg;
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
  }

  &__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    border-radius: $border-radius-full;
    font-size: $font-md;
    font-weight: 600;
    transition: all $transition-fast;

    &--cancel {
      background-color: $bg-card;
      color: $text-secondary;

      &:active {
        background-color: $bg-hover;
      }
    }

    &--confirm {
      background: $gradient-neon;
      color: $on-primary;
      box-shadow: $shadow-neon-pink;

      &:active {
        opacity: 0.9;
        transform: scale(0.97);
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
