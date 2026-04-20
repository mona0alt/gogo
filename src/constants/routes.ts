export const ROUTES = {
  // TabBar 页面
  HOME: '/pages/index/index',
  HALL: '/pages/hall/index',
  FOLLOWING: '/pages/following/index',
  MINE: '/pages/mine/index',

  // 认证
  LOGIN: '/pages/login/index',
  PROFILE_SETUP: '/pages/profile-setup/index',

  // 酒吧
  BAR_DETAIL: (id: string) => `/pages/bar-detail/index?id=${id}`,

  // 商品
  PRODUCT_SEARCH: '/pages/product-search/index',
  PRODUCT_DETAIL: (id: string) => `/pages/product-detail/index?id=${id}`,

  // 订单
  ORDER: '/pages/order/index',
  ORDERS: '/pages/orders/index',
  ORDER_DETAIL: (id: string, status?: string) =>
    `/pages/order-detail/index?id=${id}${status ? `&status=${status}` : ''}`,
  CHECKOUT: '/pages/checkout/index',
  CART: '/pages/cart/index',

  // 拼团
  GROUP_GENDER: '/pages/group-gender/index',
  GROUP_TIME: '/pages/group-time/index',
  GROUP_BAR: '/pages/group-bar/index',
  GROUP_MATCH: (groupId?: string) =>
    `/pages/group-match/index${groupId ? `?groupId=${groupId}` : ''}`,
  GROUP_STATUS: '/pages/group-status/index',
  HALL_DETAIL: (id: string) => `/pages/hall-detail/index?id=${id}`,
  HALL_CREATE: '/pages/hall-create/index',

  // 社交
  MATCH_INVITES: '/pages/match-invites/index',

  // 会员
  MEMBER: '/pages/member/index',
} as const
