import type {
  User,
  Bar,
  Product,
  CartItem,
  Order,
  GroupWithCreator,
  MatchRequest,
  CreatorInfo,
  Group,
} from './domain'

export interface CloudResult<T = unknown> {
  success: boolean
  [key: string]: unknown
}

export interface PaginatedList<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// Cloud function return types (flat structure matching actual responses)
export type LoginResult = { success: boolean; userInfo: User }
export type BarListResult = { success: boolean; list: Bar[]; total: number }
export type CartListResult = {
  success: boolean
  list: CartItem[]
  total: number
  barId: string | null
}
export type OrderListResult = { success: boolean; list: Order[]; total: number }
export type GroupListResult = {
  success: boolean
  list: GroupWithCreator[]
  total: number
}
export type MatchInviteResult = {
  success: boolean
  list: Array<
    MatchRequest & { fromUserInfo: CreatorInfo; groupInfo: Partial<Group> }
  >
  total: number
}
