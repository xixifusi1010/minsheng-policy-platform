import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 全局 UI 状态：侧边栏折叠、主题等 */
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const isDark = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, isDark, toggleSidebar }
})
