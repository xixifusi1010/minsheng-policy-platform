<template>
  <div ref="chartRef" class="base-chart" :style="{ height }"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(
  defineProps<{
    /** ECharts 配置项 */
    option: EChartsOption
    /** 容器高度 */
    height?: string
    /** 是否开启动画 */
    animation?: boolean
  }>(),
  {
    height: '360px',
    animation: true,
  },
)

const chartRef = ref<HTMLElement>()
const chartInstance = shallowRef<echarts.ECharts>()

function render() {
  if (!chartRef.value) return
  chartInstance.value = echarts.init(chartRef.value)
  chartInstance.value.setOption(props.option)
}

function handleResize() {
  chartInstance.value?.resize()
}

/**
 * 图表初始化完成后把实例 emit 给父组件。
 * 这是父组件拿实例最可靠的方式，不依赖模板 ref 与 defineExpose 的时序。
 * 关键坑：一旦使用 defineExpose，父组件通过模板 ref 只能拿到显式暴露的字段，
 * 连 $el 都取不到，所以事件驱动才是稳的。
 */
const emit = defineEmits<{ (e: 'ready', inst: echarts.ECharts): void }>()

defineExpose({
  /** 获取 ECharts 实例（可能为 undefined，直到 onMounted 完成） */
  getInstance: () => chartInstance.value,
  /** 获取容器 DOM，供父组件用 echarts.getInstanceByDom 兜底 */
  getEl: () => chartRef.value,
  /** 手动触发重绘尺寸 */
  resize: handleResize,
})

onMounted(() => {
  render()
  window.addEventListener('resize', handleResize)
  if (chartInstance.value) emit('ready', chartInstance.value)
})

// 配置项变更时重绘
watch(
  () => props.option,
  (val) => {
    if (!chartInstance.value) return
    // notMerge=true 保证数据切换时不残留旧系列
    chartInstance.value.setOption(val, true)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
  chartInstance.value = undefined
})
</script>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
