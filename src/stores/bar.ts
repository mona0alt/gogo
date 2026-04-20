import { defineStore } from 'pinia'
import type { Bar } from '@/types/domain'
import { barApi } from '@/api'

interface BarState {
  currentBar: Bar | null
  barList: Bar[]
  nearbyBars: Bar[]
  categories: Array<Record<string, unknown>>
  filters: {
    category: string
    keyword: string
  }
}

export const useBarStore = defineStore('bar', {
  state: (): BarState => ({
    currentBar: null,
    barList: [],
    nearbyBars: [],
    categories: [],
    filters: {
      category: '',
      keyword: '',
    },
  }),

  getters: {
    hasSelectedBar: (state): boolean => !!state.currentBar,
  },

  actions: {
    selectBar(bar: Bar): void {
      this.currentBar = bar
    },

    async fetchBarList(
      params: Record<string, unknown> = {}
    ): Promise<{ list: Bar[]; total: number }> {
      const data = await barApi.getList({
        ...params,
        category: this.filters.category,
        keyword: this.filters.keyword,
      })
      this.barList = data?.list || []
      return data
    },

    async fetchBarDetail(id: string): Promise<{ bar: Bar }> {
      const data = await barApi.getDetail(id)
      this.currentBar = data.bar
      return data
    },

    async fetchNearbyBars(
      location?: Record<string, unknown>
    ): Promise<{ list: Bar[]; total: number }> {
      const data = await barApi.getNearby(
        location as { latitude: number; longitude: number }
      )
      this.nearbyBars = data?.list || []
      return data
    },

    setFilter(key: string, value: string): void {
      this.filters[key as keyof BarState['filters']] = value
    },

    clearFilters(): void {
      this.filters = { category: '', keyword: '' }
    },
  },
})
