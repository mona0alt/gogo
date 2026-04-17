import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 初始化云开发
wx.cloud.init({
  env: 'cloud1-d3gjrsyla8bdd9f4a',
  traceUser: true
})

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
