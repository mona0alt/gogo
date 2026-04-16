import { defineStore } from 'pinia'
import { getCartList, addToCart, updateCartItem, removeCartItem } from '../api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    barId: null,
    checkedItems: []
  }),

  getters: {
    totalQuantity: (state) => (state.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    totalAmount: (state) => (state.items || [])
      .filter(item => (state.checkedItems || []).includes(item.id))
      .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    isAllChecked: (state) => (state.items || []).length > 0 && (state.checkedItems || []).length === (state.items || []).length,
    checkedCartItems: (state) => (state.items || []).filter(item => (state.checkedItems || []).includes(item.id))
  },

  actions: {
    async fetchCartList() {
      try {
        const data = await getCartList()
        this.items = data?.list || []
        this.barId = data?.barId
        this.checkedItems = this.items.map(item => item.id)
      } catch (e) {
        console.error('Fetch cart list failed:', e)
        throw e
      }
    },

    async addItem(product, quantity = 1, specs = null) {
      try {
        const data = await addToCart({
          productId: product.id,
          barId: product.barId,
          quantity,
          specs: specs ? JSON.stringify(specs) : null,
          price: product.price,
          productName: product.name,
          productImage: product.image
        })
        await this.fetchCartList()
        return data
      } catch (e) {
        console.error('Add to cart failed:', e)
        throw e
      }
    },

    async updateQuantity(itemId, quantity) {
      try {
        await updateCartItem(itemId, { quantity })
        const item = this.items.find(i => i.id === itemId)
        if (item) { item.quantity = quantity }
      } catch (e) {
        console.error('Update cart item failed:', e)
        throw e
      }
    },

    async removeItem(itemId) {
      try {
        await removeCartItem(itemId)
        this.items = this.items.filter(item => item.id !== itemId)
        this.checkedItems = this.checkedItems.filter(id => id !== itemId)
      } catch (e) {
        console.error('Remove cart item failed:', e)
        throw e
      }
    },

    toggleCheck(itemId) {
      const index = this.checkedItems.indexOf(itemId)
      if (index > -1) {
        this.checkedItems.splice(index, 1)
      } else {
        this.checkedItems.push(itemId)
      }
    },

    toggleAllCheck() {
      if (this.isAllChecked) {
        this.checkedItems = []
      } else {
        this.checkedItems = this.items.map(item => item.id)
      }
    },

    clearCart() {
      this.items = []
      this.checkedItems = []
      this.barId = null
    }
  }
})