<template>
  <div>
    <BaseChart
      v-if="ready"
      ref="baseRef"
      :option="mapOption"
      :height="height"
      @ready="onChartReady"
    />
    <div v-else-if="error" class="map-fallback">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="地图数据加载失败"
        description="无法从公开服务加载中国地图 GeoJSON（可能受网络限制）。请查看下方的「地区分布」柱状图了解区域分布。"
      />
    </div>
    <div v-else class="map-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>正在加载中国地图…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { Loading } from '@element-plus/icons-vue'
import BaseChart from './BaseChart.vue'

const props = withDefaults(
  defineProps<{
    /** 允许 value 为 null：表示该省在该指标上「未规定 / 无数据」，地图显示灰色底 */
    data: Array<{ name: string; value: number | null }>
    height?: string
    /** 指标名称，用于 tooltip 文案，如「政策数量」「护理假天数」 */
    valueName?: string
    /** 指标单位，如「项」「天」 */
    valueUnit?: string
    /** 当前选中的省份（GeoJSON 全称），用于地图高亮 */
    selected?: string | null
  }>(),
  {
    height: '520px',
    valueName: '政策数量',
    valueUnit: '项',
    selected: null,
  },
)

const emit = defineEmits<{
  /** 点击省份；传空字符串表示点击空白处取消选中 */
  (e: 'select', geoName: string): void
}>()

const baseRef = ref<InstanceType<typeof BaseChart> | null>(null)
/** 由 BaseChart 的 ready 事件注入，后续绑事件 / 高亮都用它 */
const chart = shallowRef<echarts.ECharts>()
const ready = ref(false)
const error = ref(false)

const values = computed(() => props.data.map((d) => d.value).filter((v) => v != null))
const maxValue = computed(() => Math.max(...values.value, 1))
const minValue = computed(() => Math.min(...values.value, 0))

const mapOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (p: any) => {
      const v = p?.value
      const shown = v == null || Number.isNaN(v) ? '未规定 / 无数据' : `${v} ${props.valueUnit}`
      return `${p.name}<br/>${props.valueName}: ${shown}`
    },
  },
  visualMap: {
    min: minValue.value,
    max: maxValue.value,
    left: 20,
    bottom: 24,
    text: ['高', '低'],
    calculable: true,
    // 多色配色（YlOrRd），避免单色渐变导致的视觉单调；值越大颜色越深
    inRange: {
      color: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#e31a1c'],
    },
  },
  series: [
    {
      name: props.valueName,
      type: 'map',
      map: 'china',
      roam: true,
      // 开启后 dispatchAction({type:'select'}) 才会产生选中高亮
      selectedMode: 'single',
      label: { show: false },
      emphasis: {
        label: { show: true, color: '#1f2937' },
        itemStyle: { areaColor: '#f59e0b' },
      },
      select: {
        label: { show: true, color: '#fff' },
        itemStyle: { areaColor: '#d97706', borderColor: '#92400e', borderWidth: 1.5 },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 0.6,
        areaColor: '#f3f4f6', // 无数据省份底色
      },
      // ECharts 不接受 null，用 undefined 表示「无数据」以显示灰色底
      data: props.data.map((d) => ({ name: d.name, value: d.value ?? undefined })),
    },
  ],
}))

/**
 * BaseChart 初始化完成后回调：拿到实例再绑事件。
 * 事件驱动优于模板 ref——因为 defineExpose 会屏蔽 $el 等字段，
 * 靠 ref 取实例极易拿到 undefined（这正是前两版失效的原因）。
 */
function onChartReady(inst: echarts.ECharts) {
  chart.value = inst
  bindEvents()
  applySelection()
}

/** 绑定地图点击事件：点击省份 emit 全称，点击空白取消选中 */
function bindEvents() {
  const inst = chart.value
  if (!inst) return
  /**
   * 【踩坑记录】roam:true 下 ECharts 的 series 级 'click' 事件不会派发：
   * click 的 zrender target 会落到 compound 包装组而非省份 path，
   * 事件处理器拿不到 ecData，于是整条 series click 被跳过。
   * 实测 mouseover / mousedown 仍能正确解析出省份名。
   * 因此：先用 mousedown/mouseover 记住当前省份，再在 zr 层 click 时取用。
   */
  let currentName = ''
  const remember = (p: any) => {
    if (p?.componentType === 'series' && p?.name) currentName = p.name
  }
  inst.off('mouseover')
  inst.on('mouseover', remember)
  inst.off('mousedown')
  inst.on('mousedown', remember)

  inst.getZr().off('click')
  inst.getZr().on('click', (e: any) => {
    if (!e?.target) {
      emit('select', '') // 点地图空白处 → 取消选中
      return
    }
    if (currentName) emit('select', currentName)
  })
}

/**
 * 加载地图 GeoJSON：优先使用项目内置的 public/china-geo.json（离线可用、稳定），
 * 失败时回退到 DataV 公开服务。
 */
async function loadMap() {
  const sources = [
    `${import.meta.env.BASE_URL}china-geo.json`,
    'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  ]
  for (const url of sources) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const geoJson = await res.json()
      if (!geoJson?.features?.length) continue
      echarts.registerMap('china', geoJson)
      // 渲染 BaseChart；实例由它的 @ready 事件回传，事件绑定在 onChartReady 里做
      ready.value = true
      return
    } catch {
      // 尝试下一个来源
    }
  }
  error.value = true
}

/** 应用选中高亮 */
function applySelection() {
  const inst = chart.value
  if (!inst) return
  if (props.selected) {
    inst.dispatchAction({ type: 'select', seriesIndex: 0, name: props.selected })
  } else {
    inst.dispatchAction({ type: 'unselect', seriesIndex: 0 })
  }
}

// 选中态高亮
watch(() => props.selected, applySelection)

// 切换着色指标会触发 setOption(notMerge)，选中态与事件需重新应用
watch(
  () => props.data,
  async () => {
    await nextTick()
    bindEvents()
    applySelection()
  },
)

onMounted(loadMap)
</script>

<style scoped>
.map-loading {
  height: v-bind(height);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}
.map-fallback {
  padding: 20px 0;
}
</style>
