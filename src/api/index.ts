import { callCloudFunction } from '@/utils/request'
import type {
  LoginResult,
  BarListResult,
  CartListResult,
  OrderListResult,
  GroupListResult,
  MatchInviteResult,
} from '@/types/api'
import type {
  User,
  Bar,
  Product,
  Order,
  GroupWithCreator,
} from '@/types/domain'

async function callFn<T>(
  name: string,
  data?: Record<string, unknown>
): Promise<T> {
  return callCloudFunction<T>(name, data)
}

// Auth API
export const authApi = {
  wxLogin: (code: string, nickname = '', avatar = '') =>
    callFn<LoginResult>('login', { code, nickname, avatar }),

  bindPhone: (code: string) => callFn<{ phone: string }>('bindPhone', { code }),

  getUserInfo: () => callFn<{ userInfo: User }>('getUserInfo', {}),

  updateProfile: (data: Partial<User>) =>
    callFn<{ userInfo: User }>('updateProfile', data),
}

// Bar API
export const barApi = {
  getList: (params?: {
    page?: number
    pageSize?: number
    category?: string
    keyword?: string
  }) => callFn<BarListResult>('getBarList', params as Record<string, unknown>),

  getDetail: (id: string) =>
    callFn<{ bar: Bar }>('getBarDetail', { id }),

  getNearby: (location?: { latitude: number; longitude: number }) =>
    callFn<BarListResult>('getNearbyBars', location as Record<string, unknown>),
}

// Product API
export const productApi = {
  getCategories: (barId: string) =>
    callFn<{ list: Array<{ id: string; name: string }> }>('getCategories', {
      barId,
    }),

  getList: (
    barId: string,
    params?: { categoryId?: string; keyword?: string; page?: number; pageSize?: number }
  ) =>
    callFn<{ list: Product[]; total: number }>('getProductList', {
      barId,
      ...params,
    }),

  getDetail: (id: string) =>
    callFn<{ product: Product }>('getProductDetail', { id }),
}

// Cart API
export const cartApi = {
  getList: () => callFn<CartListResult>('cart', { action: 'get' }),

  add: (item: {
    productId: string
    barId: string
    quantity: number
    price: number
    productName: string
    productImage?: string
    specs?: string | null
  }) => callFn<{ itemId: string }>('cart', { action: 'add', ...item }),

  update: (itemId: string, quantity: number) =>
    callFn<void>('cart', { action: 'update', itemId, quantity }),

  remove: (itemId: string) =>
    callFn<void>('cart', { action: 'remove', itemId }),

  clear: (barId: string) =>
    callFn<void>('cart', { action: 'clear', barId }),
}

// Order API
export const orderApi = {
  getList: (params?: {
    page?: number
    pageSize?: number
    status?: string
  }) =>
    callFn<OrderListResult>('getOrders', params as Record<string, unknown>),

  getDetail: (orderId: string) =>
    callFn<{ order: Order }>('getOrderDetail', { orderId }),

  create: (data: {
    barId: string
    barName: string
    items: Array<{
      productId: string
      productName: string
      price: number
      quantity: number
      productImage?: string
      specs?: string
    }>
    totalAmount: number
    discountAmount?: number
    payAmount?: number
    couponId?: string
    idempotencyKey?: string
  }) =>
    callFn<{ orderId: string; orderNo: string }>('createOrder', data),

  cancel: (orderId: string) =>
    callFn<void>('cancelOrder', { orderId }),

  pay: (orderId: string) => callFn<void>('payOrder', { orderId }),

  getPayParams: (orderId: string) =>
    callFn<{ nonceStr: string; package: string; paySign: string }>(
      'getPayParams',
      { orderId }
    ),
}

// Group API
export const groupApi = {
  create: (data: {
    title?: string
    barId: string
    barName: string
    packageType: string
    date: string
    startTime: string
    endTime: string
    targetGender: number
    people?: string
  }) => callFn<{ groupId: string }>('createGroup', data),

  getList: (
    params?: {
      status?: string
      barId?: string
      packageType?: string
      date?: string
      people?: string
      page?: number
      pageSize?: number
      excludeOwn?: boolean
    }
  ) => callFn<GroupListResult>('getGroupList', params),

  getStatus: (groupId: string) =>
    callFn<{
      group: GroupWithCreator
      matchInfo?: unknown
      isCreator: boolean
      isPartner: boolean
    }>('getGroupStatus', { groupId }),
}

// Match API
export const matchApi = {
  getRecommendUsers: (groupId: string, limit = 10) =>
    callFn<{ list: Array<unknown> }>('getRecommendUsers', {
      groupId,
      limit,
    }),

  sendRequest: (groupId: string, toOpenid: string) =>
    callFn<{ matchId: string }>('sendMatchRequest', { groupId, toOpenid }),

  getInvites: (params?: {
    status?: string
    page?: number
    pageSize?: number
  }) => callFn<MatchInviteResult>('getMatchInvites', params),

  respond: (matchId: string, action: 'accept' | 'reject') =>
    callFn<{ action: string }>('respondMatch', { matchId, action }),
}

// Follow API
export const followApi = {
  follow: (targetOpenid: string) =>
    callFn<void>('followUser', { targetOpenid }),

  unfollow: (targetOpenid: string) =>
    callFn<void>('unfollowUser', { targetOpenid }),

  getList: (params?: { page?: number; pageSize?: number }) =>
    callFn<{
      list: Array<{ openid: string; nickname: string; avatar: string }>
      total: number
    }>('getFollowList', params),
}

// Re-export individual APIs for backward compatibility
export const wxLogin = authApi.wxLogin
export const bindPhone = authApi.bindPhone
export const getUserInfo = authApi.getUserInfo
export const updateProfile = authApi.updateProfile

export const getBarList = barApi.getList
export const getBarDetail = barApi.getDetail
export const getNearbyBars = barApi.getNearby

export const getCategories = productApi.getCategories
export const getProductList = productApi.getList
export const getProductDetail = productApi.getDetail

export const getCartList = cartApi.getList
export const addToCart = cartApi.add
export const updateCartItem = cartApi.update
export const removeCartItem = cartApi.remove
export const clearCart = cartApi.clear

export const getOrderList = orderApi.getList
export const getOrderDetail = orderApi.getDetail
export const createOrder = orderApi.create
export const cancelOrder = orderApi.cancel
export const payOrder = orderApi.pay
export const getWxPayParams = orderApi.getPayParams
