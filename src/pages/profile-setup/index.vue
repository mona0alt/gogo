<template>
  <view class="profile-setup-page">
    <!-- Top Navigation Bar -->
    <view class="top-nav">
      <view class="nav-left">
        <text class="nav-back" @tap="onBack">←</text>
      </view>
      <text class="nav-title">PROFILE SETUP</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view class="scroll-content" scroll-y>
      <!-- Basic Info Section -->
      <view class="section">
        <view class="section-header">
          <view class="section-dot"></view>
          <text class="section-title">基础信息</text>
        </view>

        <view class="form-group">
          <!-- Avatar -->
          <view class="form-row">
            <text class="form-label">头像</text>
            <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <image class="avatar-img" :src="form.avatar || '/static/default-avatar.png'" mode="aspectFill" />
              <view class="avatar-edit">
                <text class="icon-edit">✎</text>
              </view>
            </button>
          </view>

          <!-- Nickname -->
          <view class="form-row border-row">
            <text class="form-label">用户昵称</text>
            <input
              class="form-input text-right"
              type="nickname"
              placeholder="请输入昵称"
              placeholder-class="placeholder"
              v-model="form.nickname"
            />
          </view>

          <!-- Age -->
          <view class="form-row border-row">
            <text class="form-label">年龄</text>
            <view class="form-input-wrap">
              <input
                class="form-input text-right narrow"
                type="number"
                placeholder="26"
                placeholder-class="placeholder"
                v-model="form.age"
              />
              <text class="form-unit">岁</text>
            </view>
          </view>

          <!-- Gender -->
          <view class="form-row">
            <text class="form-label">性别</text>
            <view class="gender-group">
              <view
                class="gender-btn"
                :class="{ active: form.gender === 1 }"
                @tap="form.gender = 1"
              >
                男
              </view>
              <view
                class="gender-btn"
                :class="{ active: form.gender === 2 }"
                @tap="form.gender = 2"
              >
                女
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Detailed Info Section -->
      <view class="section">
        <view class="section-header">
          <view class="section-dot"></view>
          <text class="section-title">详细信息</text>
        </view>

        <view class="detail-grid">
          <view class="detail-card">
            <text class="detail-label">身高 (cm)</text>
            <input
              class="detail-input"
              type="number"
              placeholder="175"
              placeholder-class="placeholder"
              v-model="form.height"
            />
          </view>
          <view class="detail-card">
            <text class="detail-label">体重 (kg)</text>
            <input
              class="detail-input"
              type="number"
              placeholder="55"
              placeholder-class="placeholder"
              v-model="form.weight"
            />
          </view>
          <view class="detail-card full-width">
            <text class="detail-label">星座</text>
            <picker mode="selector" :range="zodiacList" :value="zodiacIndex" @change="onZodiacChange">
              <view class="detail-value-row">
                <text class="detail-value">{{ form.zodiac || '请选择' }}</text>
                <text class="icon-arrow">▼</text>
              </view>
            </picker>
          </view>
        </view>

        <!-- Bio -->
        <view class="bio-wrap">
          <text class="detail-label">文字介绍</text>
          <view class="bio-box">
            <textarea
              class="bio-textarea"
              placeholder="请介绍您的个人性格等信息说明"
              placeholder-class="placeholder"
              maxlength="200"
              v-model="form.bio"
            />
          </view>
        </view>

        <!-- Photo Upload -->
        <view class="photo-wrap">
          <text class="detail-label">日常生活照片（可上传多张）</text>
          <view class="photo-grid">
            <view class="photo-upload" @tap="onUploadPhoto" v-if="form.photos.length < 6">
              <text class="icon-add">+</text>
              <text class="upload-text">UPLOAD</text>
            </view>
            <view
              class="photo-item"
              v-for="(photo, index) in form.photos"
              :key="index"
            >
              <image class="photo-img" :src="photo" mode="aspectFill" />
              <view class="photo-delete" @tap="onDeletePhoto(index)">
                <text class="icon-close">✕</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Bottom spacer -->
      <view style="height: 180rpx;"></view>
    </scroll-view>

    <!-- Bottom Action Bar -->
    <view class="bottom-bar">
      <view class="action-btn skip" @tap="onSkip">
        <text class="btn-icon">✕</text>
        <text class="btn-text">稍后再填</text>
      </view>
      <view class="action-btn submit" @tap="onSubmit">
        <text class="btn-icon">✓</text>
        <text class="btn-text">提交信息</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { callCloudFunction } from '@/utils/request'

const userStore = useUserStore()

const zodiacList = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
]

const form = ref({
  avatar: userStore.userInfo?.avatar || '',
  nickname: userStore.userInfo?.nickname || '',
  age: '',
  gender: 0,
  height: '',
  weight: '',
  zodiac: '',
  bio: '',
  photos: []
})

const zodiacIndex = computed(() => {
  return zodiacList.indexOf(form.value.zodiac)
})

const onChooseAvatar = (e) => {
  form.value.avatar = e.detail.avatarUrl || ''
}

const onZodiacChange = (e) => {
  form.value.zodiac = zodiacList[e.detail.value]
}

const onUploadPhoto = () => {
  const remain = 6 - form.value.photos.length
  if (remain <= 0) return

  uni.chooseMedia({
    count: remain,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFiles = res.tempFiles.map(f => f.tempFilePath)
      form.value.photos.push(...tempFiles)
    }
  })
}

const onDeletePhoto = (index) => {
  form.value.photos.splice(index, 1)
}

const onSkip = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const onSubmit = async () => {
  if (!form.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!form.value.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...', mask: true })

  try {
    // Upload avatar if it's a local temp file
    let avatarFileID = form.value.avatar
    if (form.value.avatar && (form.value.avatar.startsWith('wxfile://') || form.value.avatar.startsWith('http://tmp/'))) {
      const uploadRes = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: `user-avatars/${Date.now()}.jpg`,
          filePath: form.value.avatar,
          success: resolve,
          fail: reject
        })
      })
      avatarFileID = uploadRes.fileID
    }

    // Upload photos
    const photoFileIDs = []
    for (const photo of form.value.photos) {
      if (photo.startsWith('wxfile://') || photo.startsWith('http://tmp/')) {
        const uploadRes = await new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath: `user-photos/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
            filePath: photo,
            success: resolve,
            fail: reject
          })
        })
        photoFileIDs.push(uploadRes.fileID)
      } else {
        photoFileIDs.push(photo)
      }
    }

    // Call cloud function to save profile
    await callCloudFunction('updateProfile', {
      avatar: avatarFileID,
      nickname: form.value.nickname.trim(),
      age: parseInt(form.value.age) || 0,
      gender: form.value.gender,
      height: parseInt(form.value.height) || 0,
      weight: parseInt(form.value.weight) || 0,
      zodiac: form.value.zodiac,
      bio: form.value.bio.trim(),
      photos: photoFileIDs
    })

    // Update local store
    await userStore.fetchUserInfo()

    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 800)
  } catch (err) {
    console.error('Save profile failed:', err)
    uni.showToast({ title: err.message || '保存失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const onBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.profile-setup-page {
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
  background: rgba($bg-primary, 0.8);
  backdrop-filter: blur(20px);
}

.nav-left {
  width: 80rpx;
}

.nav-back {
  font-size: 36rpx;
  color: $primary;
}

.nav-title {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: $primary;
  text-transform: uppercase;
}

.nav-right {
  width: 80rpx;
}

/* Scroll Content */
.scroll-content {
  flex: 1;
  padding-top: 88rpx;
}

/* Section */
.section {
  padding: 40rpx 30rpx 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.section-dot {
  width: 6rpx;
  height: 24rpx;
  background: $primary;
  border-radius: 3rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: bold;
  letter-spacing: 0.2em;
  color: $text-primary;
  text-transform: uppercase;
}

/* Form */
.form-group {
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 0 30rpx;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
}

.border-row {
  border-bottom: 1rpx solid rgba($outline-variant, 0.1);
}

.form-label {
  font-size: 28rpx;
  color: $text-secondary;
  letter-spacing: 1rpx;
}

.form-input {
  font-size: 28rpx;
  color: $text-primary;
  background: transparent;
  border: none;
}

.form-input.text-right {
  text-align: right;
}

.form-input.narrow {
  width: 80rpx;
  text-align: right;
}

.form-input-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-unit {
  font-size: 24rpx;
  color: $text-secondary;
}

.placeholder {
  color: rgba($outline-variant, 0.5);
}

/* Avatar */
.avatar-btn {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  overflow: visible;
}

.avatar-btn::after {
  border: none;
}

.avatar-img {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  border: 2rpx solid rgba($outline-variant, 0.3);
}

.avatar-edit {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 36rpx;
  height: 36rpx;
  background: $primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $bg-primary;
}

.icon-edit {
  font-size: 18rpx;
  color: $on-primary;
}

/* Gender */
.gender-group {
  display: flex;
  gap: 16rpx;
}

.gender-btn {
  padding: 10rpx 32rpx;
  border-radius: $border-radius-full;
  background: $bg-hover;
  color: $text-secondary;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.gender-btn.active {
  background: $primary;
  color: $on-primary;
  font-weight: bold;
  box-shadow: 0 0 30rpx rgba($primary, 0.2);
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.detail-card {
  background: $bg-secondary;
  border-radius: $border-radius-lg;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-card.full-width {
  grid-column: span 2;
}

.detail-label {
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: $text-secondary;
  text-transform: uppercase;
}

.detail-input {
  font-size: 36rpx;
  font-weight: 600;
  color: $text-primary;
  background: transparent;
  border: none;
  padding: 0;
  height: 50rpx;
}

.detail-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-value {
  font-size: 28rpx;
  color: $text-primary;
}

.icon-arrow {
  font-size: 24rpx;
  color: $outline-variant;
}

/* Bio */
.bio-wrap {
  margin-top: 30rpx;
}

.bio-box {
  margin-top: 16rpx;
  background: $bg-dim;
  border-radius: $border-radius-lg;
  padding: 24rpx;
  border: 1rpx solid rgba($outline-variant, 0.1);
}

.bio-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
  background: transparent;
  border: none;
}

/* Photos */
.photo-wrap {
  margin-top: 40rpx;
}

.photo-grid {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.photo-upload {
  aspect-ratio: 1;
  background: $bg-hover;
  border-radius: $border-radius-lg;
  border: 2rpx dashed rgba($outline-variant, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.photo-upload:active {
  border-color: rgba($primary, 0.5);
}

.icon-add {
  font-size: 48rpx;
  color: $outline-variant;
  font-weight: 300;
}

.upload-text {
  font-size: 20rpx;
  color: rgba($outline-variant, 0.7);
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:active .photo-delete {
  opacity: 1;
}

.icon-close {
  font-size: 40rpx;
  color: #fff;
  font-weight: 300;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 30rpx 48rpx;
  background: rgba($bg-primary, 0.9);
  backdrop-filter: blur(40px);
  border-radius: 48rpx 48rpx 0 0;
  box-shadow: 0 -20rpx 80rpx -20rpx rgba($primary, 0.15);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 48rpx;
  border-radius: $border-radius-full;
  transition: all 0.3s ease;
}

.action-btn.skip {
  color: $text-secondary;
}

.action-btn.skip:active {
  background: $bg-hover;
  transform: scale(0.95);
}

.action-btn.submit {
  background: $primary;
  color: $on-primary;
  box-shadow: 0 8rpx 40rpx rgba($primary, 0.3);
}

.action-btn.submit:active {
  transform: scale(0.95);
}

.btn-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.btn-text {
  font-size: 20rpx;
  font-weight: bold;
  letter-spacing: 0.1em;
}
</style>
