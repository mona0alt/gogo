export interface User {
  id: string
  openid?: string
  nickname: string
  avatar: string
  phone?: string
  age: number
  gender: number
  height: number
  weight: number
  zodiac: string
  bio: string
  interests: string
  photos: string[]
  profileCompleted: boolean
  memberLevel?: '' | 'vip' | 'svip'
  balance?: number
  createdAt?: string
  updatedAt?: string
}

export interface Bar {
  id: string
  name: string
  coverImage?: string
  category: string
  categoryName: string
  address: string
  rating: number
  status: 'open' | 'closed'
  distance: string
  price: number
  tags: string[]
  description: string
  openingHours: string
  minimumSpend: number
}

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  categoryId: string
  barId: string
  sales: number
  stock: number
  status: 'active' | 'inactive'
}

export interface CartItem {
  id: string
  productId: string
  barId: string
  quantity: number
  price: number
  productName: string
  productImage: string
  specs?: string
  status: 'active' | 'inactive'
}

export type OrderStatus =
  | 'pending_payment'
  | 'pending_use'
  | 'in_use'
  | 'completed'
  | 'cancelled'
  | 'refunding'

export interface OrderItem {
  id?: string
  productId: string
  productName: string
  price: number
  quantity: number
  productImage: string
  specs?: string
}

export interface Order {
  id: string
  orderNo: string
  userId: string
  barId: string
  barName: string
  barAddress?: string
  items: OrderItem[]
  totalAmount: number
  discountAmount?: number
  payAmount?: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  createTime?: string
  payTime?: string
}

export interface Group {
  _id: string
  creatorOpenid: string
  title?: string
  targetGender: number
  barId: string
  barName: string
  packageType: string
  date: string
  startTime: string
  endTime: string
  people?: string
  status: 'matching' | 'paired' | 'cancelled'
  matchedUserOpenid?: string
  createdAt: Date
  updatedAt: Date
}

export interface MatchRequest {
  _id: string
  groupId: string
  fromOpenid: string
  toOpenid: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

export interface CreatorInfo {
  nickname: string
  avatar: string
  age: number
  gender: number
}

export interface GroupWithCreator extends Group {
  creatorInfo: CreatorInfo
}

export interface FollowRecord {
  followerOpenid: string
  followingOpenid: string
  createdAt: Date
}

export type CouponType = 'fixed' | 'threshold' | 'discount'
export type CouponScopeType = 'all' | 'bar' | 'category'
export type UserCouponStatus = 'unused' | 'used' | 'expired'

export interface Coupon {
  id: string
  name: string
  type: CouponType
  value: number
  threshold: number
  scopeType: CouponScopeType
  scopeTarget?: string
  validDays: number
  status: 'active' | 'inactive'
}

export interface UserCoupon {
  id: string
  couponId: string
  name: string
  type: CouponType
  value: number
  threshold: number
  scopeType: CouponScopeType
  scopeTarget?: string
  status: UserCouponStatus
  expireAt: string
  usedAt?: string
  orderId?: string
}

export interface DeliveryAddress {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}
