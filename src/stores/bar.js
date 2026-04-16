import { defineStore } from 'pinia'
import { getBarList, getBarDetail, getNearbyBars } from '../api/bar'

export const useBarStore = defineStore('bar', {
  state: () => ({
    currentBar: null,
    barList: [],
    nearbyBars: [],
    categories: [],
    filters: {
      category: '',
      keyword: ''
    }
  }),

  getters: {
    hasSelectedBar: (state) => !!state.currentBar
  },

  actions: {
    selectBar(bar) {
      this.currentBar = bar
      uni.setStorageSync('currentBar', bar)
    },

    async fetchBarList(params = {}) {
      try {
        const data = await getBarList({
          ...params,
          category: this.filters.category,
          keyword: this.filters.keyword
        })
        this.barList = data.list
        return data
      } catch (e) {
        console.error('Fetch bar list failed:', e)
        throw e
      }
    },

    async fetchBarDetail(id) {
      try {
        const data = await getBarDetail(id)
        this.currentBar = data
        uni.setStorageSync('currentBar', data)
        return data
      } catch (e) {
        console.error('Fetch bar detail failed:', e)
        throw e
      }
    },

    async fetchNearbyBars(location) {
      try {
        const data = await getNearbyBars(location)
        this.nearbyBars = data.list
        return data
      } catch (e) {
        console.error('Fetch nearby bars failed:', e)
        throw e
      }
    },

    setFilter(key, value) {
      this.filters[key] = value
    },

    clearFilters() {
      this.filters = { category: '', keyword: '' }
    }
  }
})