import { defineStore } from 'pinia'
import { getOrderList, getOrderDetail, createOrder, cancelOrder } from '../api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    filters: {
      status: ''
    }
  }),

  getters: {
    ordersByStatus: (state) => {
      const groups = {
        all: [],
        pending_payment: [],
        pending_use: [],
        completed: [],
        cancelled: []
      }
      ;(state.orders || []).forEach(order => {
        groups.all.push(order)
        if (groups[order.status]) {
          groups[order.status].push(order)
        }
      })
      return groups
    }
  },

  actions: {
    async fetchOrderList(params = {}) {
      try {
        const data = await getOrderList({
          ...params,
          status: this.filters.status
        })
        this.orders = data?.list || []
        return data
      } catch (e) {
        console.error('Fetch order list failed:', e)
        throw e
      }
    },

    async fetchOrderDetail(id) {
      try {
        const data = await getOrderDetail(id)
        this.currentOrder = data
        return data
      } catch (e) {
        console.error('Fetch order detail failed:', e)
        throw e
      }
    },

    async createOrder(orderData) {
      try {
        const data = await createOrder(orderData)
        return data
      } catch (e) {
        console.error('Create order failed:', e)
        throw e
      }
    },

    async cancelOrderById(id) {
      try {
        await cancelOrder(id)
        const order = this.orders.find(o => o.id === id)
        if (order) { order.status = 'cancelled' }
      } catch (e) {
        console.error('Cancel order failed:', e)
        throw e
      }
    },

    setStatusFilter(status) {
      this.filters.status = status
    }
  }
})