<template>
  <view class="hall-detail-page">
    <!-- Top Navigation -->
    <view class="top-nav">
      <view class="nav-left" @tap="onBack">
        <view class="nav-back-btn">
          <text class="nav-back">←</text>
        </view>
        <text class="nav-title">拼桌详情</text>
      </view>
      <image class="nav-avatar" src="/static/default-avatar.png" mode="aspectFill" />
    </view>

    <scroll-view class="scroll-content" scroll-y>
      <!-- Hero Banner -->
      <view class="hero-banner">
        <image class="hero-img" src="/static/default-bar.png" mode="aspectFill" />
        <view class="hero-overlay"></view>
        <view class="hero-badge">
          <text class="badge-text">SVIP EXCLUSIVE</text>
        </view>
      </view>

      <!-- Info Card -->
      <view class="info-card">
        <view class="info-header">
          <text class="info-title">来两个男生，今晚气氛拉满</text>
          <view class="info-status">
            <text class="status-label">Status</text>
            <text class="status-value">进行中</text>
          </view>
        </view>

        <view class="info-grid">
          <view class="info-item">
            <text class="info-icon">⏰</text>
            <text class="info-item-label">Time</text>
            <text class="info-item-value">明天 18:00</text>
          </view>
          <view class="info-item">
            <text class="info-icon">🍸</text>
            <text class="info-item-label">Package</text>
            <text class="info-item-value gold">畅饮套餐</text>
          </view>
        </view>

        <view class="bar-row">
          <view class="bar-icon-wrap">
            <text class="bar-icon">🍷</text>
          </view>
          <view class="bar-info">
            <text class="bar-name">XXXX顶级酒吧</text>
            <text class="bar-address">外滩18号尊享店</text>
          </view>
          <view class="bar-link">
            <text class="bar-link-text">查看详情</text>
            <text class="bar-link-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- Members Section -->
      <view class="members-section">
        <view class="members-header">
          <text class="members-title">拼团成员</text>
          <text class="members-count">3/6 Joined</text>
        </view>

        <view class="members-visual">
          <view class="members-left">
            <view class="member-avatar-wrap host">
              <image class="member-avatar" src="/static/default-avatar.png" mode="aspectFill" />
              <view class="host-badge">HOST</view>
            </view>
            <view class="member-avatar-wrap">
              <image class="member-avatar" src="/static/default-avatar.png" mode="aspectFill" />
            </view>
            <view class="member-slot">
              <text class="slot-icon">+</text>
            </view>
          </view>

          <view class="table-visual">
            <image class="table-img" src="/static/default-bar.png" mode="aspectFill" />
            <view class="table-overlay"></view>
            <text class="table-label">Main Table</text>
          </view>

          <view class="members-right">
            <view class="member-avatar-wrap">
              <image class="member-avatar" src="/static/default-avatar.png" mode="aspectFill" />
            </view>
            <view class="member-slot">
              <text class="slot-icon">+</text>
            </view>
            <view class="member-slot">
              <text class="slot-icon">+</text>
            </view>
          </view>

          <view class="watermark">GATHER</view>
        </view>
      </view>

      <!-- Rules Section -->
      <view class="rules-section">
        <view class="rules-card">
          <view class="rules-header">
            <text class="rules-icon">ℹ</text>
            <text class="rules-title">拼桌规则</text>
          </view>
          <view class="rules-list">
            <view class="rule-item">
              <text class="rule-num">01</text>
              <text class="rule-text">拼桌成功后请准时到达，超过30分钟未到视为自动放弃。</text>
            </view>
            <view class="rule-item">
              <text class="rule-num">02</text>
              <text class="rule-text">套餐包含基础畅饮，额外点单需成员间自行商议费用。</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Bottom Actions -->
    <view class="bottom-actions">
      <view class="action-btn invite" @tap="onInvite">
        <text class="invite-text">邀请好友</text>
      </view>
      <view class="action-btn join" @tap="onJoin">
        <text class="join-text">立即加入</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const onBack = () => {
  uni.navigateBack()
}

const onInvite = () => {
  uni.showToast({ title: '邀请好友', icon: 'none' })
}

const onJoin = () => {
  uni.showToast({ title: '申请加入中...', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.hall-detail-page {
  min-height: 100vh;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

/* Top Navigation */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  background: $bg-primary;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.nav-back-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba($bg-hover, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 32rpx;
  color: $primary;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $primary;
}

.nav-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid rgba($primary, 0.2);
  padding: 4rpx;
  background: $bg-hover;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  height: 560rpx;
  width: 100%;
  overflow: hidden;
}

.hero-img {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, $bg-primary, transparent);
}

.hero-badge {
  position: absolute;
  bottom: 48rpx;
  left: 30rpx;
}

.badge-text {
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: $primary;
  background: rgba($primary, 0.2);
  backdrop-filter: blur(20rpx);
  padding: 8rpx 24rpx;
  border-radius: $border-radius-full;
  border: 1rpx solid rgba($primary, 0.2);
  text-transform: uppercase;
}

/* Info Card */
.info-card {
  margin: -96rpx 30rpx 0;
  position: relative;
  z-index: 10;
  background: rgba($bg-hover, 0.6);
  backdrop-filter: blur(40rpx);
  border-radius: $border-radius-lg;
  padding: 48rpx;
  border: 1rpx solid rgba($outline-variant, 0.15);
  box-shadow: 0 40rpx 120rpx -20rpx rgba($primary, 0.15);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48rpx;
}

.info-title {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-primary;
  line-height: 1.3;
  flex: 1;
  max-width: 70%;
}

.info-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.status-label {
  font-size: 20rpx;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: $text-secondary;
  text-transform: uppercase;
}

.status-value {
  font-size: 26rpx;
  font-weight: bold;
  color: $primary;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.info-item {
  background: $bg-dim;
  padding: 24rpx;
  border-radius: $border-radius-md;
  border: 1rpx solid rgba($outline-variant, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-icon {
  font-size: 24rpx;
  margin-bottom: 4rpx;
}

.info-item-label {
  font-size: 20rpx;
  letter-spacing: 0.15em;
  color: $text-secondary;
  text-transform: uppercase;
}

.info-item-value {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.info-item-value.gold {
  color: $primary;
}

.bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32rpx;
  border-top: 1rpx solid rgba($outline-variant, 0.15);
}

.bar-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: $border-radius-md;
  background: $bg-card;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-icon {
  font-size: 36rpx;
}

.bar-info {
  flex: 1;
  margin-left: 24rpx;
}

.bar-name {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-primary;
}

.bar-address {
  font-size: 22rpx;
  color: $text-secondary;
}

.bar-link {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.bar-link-text {
  font-size: 22rpx;
  font-weight: bold;
  color: $primary;
}

.bar-link-arrow {
  font-size: 28rpx;
  color: $primary;
  transition: transform 0.3s ease;
}

.bar-link:active .bar-link-arrow {
  transform: translateX(8rpx);
}

/* Members Section */
.members-section {
  margin-top: 60rpx;
  padding: 0 30rpx;
}

.members-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.members-title {
  font-size: 36rpx;
  font-weight: bold;
  color: $text-primary;
  letter-spacing: 1rpx;
}

.members-count {
  font-size: 22rpx;
  letter-spacing: 0.15em;
  color: $text-secondary;
  text-transform: uppercase;
}

.members-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  min-height: 560rpx;
}

.members-left,
.members-right {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
  align-items: center;
  flex: 1;
}

.members-left {
  align-items: flex-end;
}

.members-right {
  align-items: flex-start;
}

.member-avatar-wrap {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 4rpx solid rgba($outline-variant, 0.3);
  overflow: hidden;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.member-avatar-wrap.host {
  width: 128rpx;
  height: 128rpx;
  border-color: $primary;
  opacity: 1;
  position: relative;
}

.member-avatar {
  width: 100%;
  height: 100%;
}

.host-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  background: $primary;
  color: $on-primary;
  font-size: 16rpx;
  font-weight: bold;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.member-slot {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 2rpx dashed rgba($outline-variant, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
}

.slot-icon {
  font-size: 36rpx;
  color: $outline-variant;
}

.table-visual {
  position: relative;
  width: 384rpx;
  height: 512rpx;
  background: rgba($bg-hover, 0.4);
  backdrop-filter: blur(20rpx);
  border-radius: 48rpx;
  overflow: hidden;
  border: 1rpx solid rgba($outline-variant, 0.2);
  box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
}

.table-visual:active {
  transform: scale(1.02);
}

.table-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.table-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba($primary, 0.2), transparent);
}

.table-label {
  position: absolute;
  bottom: 32rpx;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.3em;
  color: $primary;
  text-transform: uppercase;
}

.watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 240rpx;
  font-weight: 900;
  letter-spacing: -4rpx;
  color: rgba(255, 255, 255, 0.03);
  text-transform: uppercase;
  pointer-events: none;
}

/* Rules Section */
.rules-section {
  margin-top: 60rpx;
  padding: 0 30rpx;
}

.rules-card {
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 36rpx;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.rules-icon {
  font-size: 36rpx;
  color: $primary;
}

.rules-title {
  font-size: 26rpx;
  font-weight: bold;
  color: $text-primary;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.rule-item {
  display: flex;
  gap: 24rpx;
}

.rule-num {
  font-size: 22rpx;
  font-weight: bold;
  color: $primary;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.rule-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
}

/* Bottom Actions */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 30rpx 48rpx;
  background: rgba($bg-primary, 0.9);
  backdrop-filter: blur(40rpx);
  border-top: 1rpx solid rgba($outline-variant, 0.2);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28rpx 0;
  border-radius: $border-radius-full;
  transition: all 0.3s ease;
}

.action-btn.invite {
  flex: 1;
  border: 2rpx solid $primary;
  background: transparent;
}

.action-btn.invite:active {
  background: rgba($primary, 0.05);
  transform: scale(0.95);
}

.invite-text {
  font-size: 26rpx;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: $primary;
  text-transform: uppercase;
}

.action-btn.join {
  flex: 2;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  box-shadow: 0 8rpx 32rpx rgba($primary, 0.2);
}

.action-btn.join:active {
  transform: scale(0.95);
}

.join-text {
  font-size: 26rpx;
  font-weight: 900;
  letter-spacing: 0.15em;
  color: $on-primary;
  text-transform: uppercase;
}
</style>