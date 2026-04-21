<template>
  <view class="page">
    <view class="header">
      <image class="logo" src="/static/default-avatar.png" mode="aspectFit" />
      <text class="app-name">酒吧聚合平台</text>
      <text class="version">版本 {{ version }}</text>
    </view>

    <view class="intro-card">
      <text class="intro-title">平台简介</text>
      <text class="intro-text">
        我们是一家专注于酒吧/夜店聚合消费的平台，致力于为用户提供便捷的预订、点单和社交服务。无论您想寻找附近的热门酒吧，还是与志同道合的朋友组局畅饮，我们都能满足您的需求。
      </text>
    </view>

    <view class="contact-card">
      <view class="contact-item" @tap="makePhoneCall">
        <text class="label">客服电话</text>
        <text class="value">400-888-9999</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const version = ref('1.0.0')

const makePhoneCall = () => {
  uni.makePhoneCall({ phoneNumber: '4008889999' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0;

  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: $spacing-md;
  }

  .app-name {
    font-size: $font-xl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .version {
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.intro-card,
.contact-card {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.intro-title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-sm;
}

.intro-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    font-size: $font-md;
    color: $text-primary;
  }

  .value {
    font-size: $font-md;
    color: $primary;
  }
}
</style>
