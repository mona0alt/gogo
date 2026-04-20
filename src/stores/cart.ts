import { defineStore } from 'pinia'
import type { CartItem } from '@/types/domain'
import { cartApi } from '@/api'

interface CartState {
  items: CartItem[]
  barId: string | null
  checkedItems: string[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    barId: null,
    checkedItems: [],
  }),

  getters: {
    totalQuantity: (state): number =>
      (state.items || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      ),

    totalAmount: (state): number =>
      (state.items || [])
        .filter((item) => (state.checkedItems || []).includes(item.id))
        .reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
          0
        ),

    isAllChecked: (state): boolean =>
      (state.items || []).length > 0 &&
      (state.checkedItems || []).length === (state.items || []).length,

    checkedCartItems: (state): CartItem[] =>
      (state.items || []).filter((item) =>
        (state.checkedItems || []).includes(item.id)
      ),
  },

  actions: {
    async fetchCartList(): Promise<void> {
      const data = await cartApi.getList()
      this.items = data?.list || []
      this.barId = data?.barId || null
      this.checkedItems = this.items.map((item) => item.id)
    },

    async addItem(
      product: Record<string, unknown>,
      quantity = 1,
      specs: Record<string, unknown> | null = null
    ): Promise<{ itemId: string }> {
      const data = await cartApi.add({
        productId: product.id as string,
        barId: product.barId as string,
        quantity,
        specs: specs ? JSON.stringify(specs) : null,
        price: product.price as number,
        productName: product.name as string,
        productImage: (product.image as string) || '',
      })
      await this.fetchCartList()
      return data
    },

    async updateQuantity(itemId: string, quantity: number): Promise<void> {
      await cartApi.update(itemId, quantity)
      const item = this.items.find((i) => i.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },

    async removeItem(itemId: string): Promise<void> {
      await cartApi.remove(itemId)
      this.items = this.items.filter((item) => item.id !== itemId)
      this.checkedItems = this.checkedItems.filter((id) => id !== itemId)
    },

    toggleCheck(itemId: string): void {
      const index = this.checkedItems.indexOf(itemId)
      if (index > -1) {
        this.checkedItems.splice(index, 1)
      } else {
        this.checkedItems.push(itemId)
      }
    },

    toggleAllCheck(): void {
      if (this.isAllChecked) {
        this.checkedItems = []
      } else {
        this.checkedItems = this.items.map((item) => item.id)
      }
    },

    clearCart(): void {
      this.items = []
      this.checkedItems = []
      this.barId = null
    },
  },
})
