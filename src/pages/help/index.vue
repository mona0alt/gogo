<template>
  <view class="page">
    <view class="help-group">
      <view class="group-title">下单流程</view>
      <view class="help-item">
        <view class="question">如何下单？</view>
        <view class="answer">浏览酒吧或商品详情页，选择商品加入购物车，进入结算页确认订单信息后支付即可。</view>
      </view>
      <view class="help-item">
        <view class="question">支持哪些支付方式？</view>
        <view class="answer">目前仅支持微信支付。</view>
      </view>
      <view class="help-item">
        <view class="question">如何取消订单？</view>
        <view class="answer">在"我的订单"中找到待支付或待使用的订单，点击取消即可。已支付订单请联系客服处理。</view>
      </view>
    </view>

    <view class="help-group">
      <view class="group-title">配送说明</view>
      <view class="help-item">
        <view class="question">配送范围是多大？</view>
        <view class="answer">目前支持同城配送，具体范围以各酒吧实际服务范围为准。</view>
      </view>
      <view class="help-item">
        <view class="question">配送时间是多久？</view>
        <view class="answer">下单后一般1-2小时内送达，高峰期可能略有延迟。</view>
      </view>
    </view>

    <view class="help-group">
      <view class="group-title">退换规则</view>
      <view class="help-item">
        <view class="question">未使用可以退款吗？</view>
        <view class="answer">未使用的订单可在订单详情中申请退款，审核通过后原路退回。</view>
      </view>
    </view>

    <view class="help-group">
      <view class="group-title">账户安全</view>
      <view class="help-item">
        <view class="question">如何修改个人信息？</view>
        <view class="answer">进入"我的"页面，点击头像区域即可进入个人资料编辑页。</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 纯静态页面，无需逻辑
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
}

.help-group {
  background-color: $bg-secondary;
  border-radius: $border-radius-xl;
  padding: 0 $spacing-md;
  margin-bottom: $spacing-md;

  .group-title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color;
  }
}

.help-item {
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
  }

  .question {
    font-size: $font-md;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .answer {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.6;
  }
}
</style>
