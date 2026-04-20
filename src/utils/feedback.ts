import { useFeedbackStore } from '@/stores/feedback'

interface ModalOptions {
  title?: string
  content?: string
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
}

interface ToastOptions {
  title: string
  icon?: 'success' | 'none'
  duration?: number
}

interface LoadingOptions {
  title?: string
  mask?: boolean
}

export function showModal(options: ModalOptions): Promise<{ confirm: boolean }> {
  const store = useFeedbackStore()
  return store.showModal(options)
}

export function showToast(options: ToastOptions): void {
  const store = useFeedbackStore()
  store.showToast(options)
}

export function showLoading(options: LoadingOptions = {}): void {
  const store = useFeedbackStore()
  store.showLoading(options)
}

export function hideLoading(): void {
  const store = useFeedbackStore()
  store.hideLoading()
}
