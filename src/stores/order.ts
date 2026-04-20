import { defineStore } from 'pinia'
import type { Order, OrderStatus } from '@/types/domain'
import { orderApi } from '@/api'

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  filters: {
    status: string
  }
}

interface OrdersByStatus {
  all: Order[]
  pending_payment: Order[]
  pending_use: Order[]
  completed: Order[]
  cancelled: Order[]
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orders: [],
    currentOrder: null,
    filters: {
      status: '',
    },
  }),

  getters: {
    ordersByStatus: (state): OrdersByStatus => {
      const groups: OrdersByStatus = {
        all: [],
        pending_payment: [],
        pending_use: [],
        completed: [],
        cancelled: [],
      }
      ;(state.orders || []).forEach((order) => {
        groups.all.push(order)
        if (groups[order.status as keyof OrdersByStatus]) {
          groups[order.status as keyof OrdersByStatus].push(order)
        }
      })
      return groups
    },
  },

  actions: {
    async fetchOrderList(params: Record<string, unknown> = {}): Promise<{
      list: Order[]
      total: number
    }> {
      const data = await orderApi.getList({
        ...params,
        status: this.filters.status,
      })
      this.orders = data?.list || []
      return data
    },

    async fetchOrderDetail(id: string): Promise<{ order: Order }> {
      const data = await orderApi.getDetail(id)
      this.currentOrder = data.order
      return data
    },

    async createOrder(
      orderData: Record<string, unknown>
    ): Promise<{ orderId: string; orderNo: string }> {
      const data = await orderApi.create(
        orderData as Parameters<typeof orderApi.create>[0]
      )
      return data
    },

    async cancelOrderById(id: string): Promise<void> {
      await orderApi.cancel(id)
      const order = this.orders.find((o) => o.id === id)
      if (order) {
        order.status = 'cancelled'
      }
    },

    setStatusFilter(status: string): void {
      this.filters.status = status
    },
  },
})
