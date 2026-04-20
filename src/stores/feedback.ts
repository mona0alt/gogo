import { defineStore } from 'pinia'

interface ModalOptions {
  title?: string
  content?: string
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
}

interface ModalResolve {
  // eslint-disable-next-line no-unused-vars
  (value: { confirm: boolean }): void
}

interface ModalState extends ModalOptions {
  visible: boolean
  resolve: ModalResolve | null
}

interface ToastOptions {
  title: string
  icon?: 'success' | 'none'
  duration?: number
}

interface ToastState extends ToastOptions {
  visible: boolean
  timer: ReturnType<typeof setTimeout> | null
}

interface LoadingOptions {
  title?: string
  mask?: boolean
}

interface LoadingState extends LoadingOptions {
  visible: boolean
}

interface FeedbackState {
  modal: ModalState
  toast: ToastState
  loading: LoadingState
}

export const useFeedbackStore = defineStore('feedback', {
  state: (): FeedbackState => ({
    modal: {
      visible: false,
      title: '',
      content: '',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      resolve: null,
    },
    toast: {
      visible: false,
      title: '',
      icon: 'none',
      duration: 2000,
      timer: null,
    },
    loading: {
      visible: false,
      title: '加载中...',
      mask: true,
    },
  }),

  actions: {
    showModal(options: ModalOptions): Promise<{ confirm: boolean }> {
      return new Promise((resolve) => {
        this.modal = {
          visible: true,
          title: options.title || '',
          content: options.content || '',
          showCancel: options.showCancel !== false,
          cancelText: options.cancelText || '取消',
          confirmText: options.confirmText || '确定',
          resolve,
        }
      })
    },

    closeModal(confirm: boolean): void {
      this.modal.visible = false
      if (this.modal.resolve) {
        this.modal.resolve({ confirm })
        this.modal.resolve = null
      }
    },

    showToast(options: ToastOptions): void {
      if (this.toast.timer) {
        clearTimeout(this.toast.timer)
        this.toast.timer = null
      }
      this.toast = {
        visible: true,
        title: options.title,
        icon: options.icon || 'none',
        duration: options.duration || 2000,
        timer: null,
      }
      this.toast.timer = setTimeout(() => {
        this.toast.visible = false
      }, this.toast.duration)
    },

    showLoading(options: LoadingOptions = {}): void {
      this.loading = {
        visible: true,
        title: options.title || '加载中...',
        mask: options.mask !== false,
      }
    },

    hideLoading(): void {
      this.loading.visible = false
    },
  },
})
