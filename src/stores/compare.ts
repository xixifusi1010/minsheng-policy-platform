import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 法规对比栏：跨页面共享。
 * 地图页点击卡片的"对比" / 法规对比页的"对比"都会加进来，
 * 仅在法规对比页底部展示对比栏。
 */
export const useCompareStore = defineStore('compare', () => {
  const list = ref<string[]>([])
  const max = 4

  function add(geo: string) {
    if (!geo) return
    if (list.value.includes(geo)) return
    if (list.value.length >= max) list.value.shift()
    list.value.push(geo)
  }

  function remove(geo: string) {
    list.value = list.value.filter((g) => g !== geo)
  }

  function clear() {
    list.value = []
  }

  return { list, max, add, remove, clear }
})
