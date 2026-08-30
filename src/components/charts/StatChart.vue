<template>
  <div class="stat-chart">
    <!-- 数字卡组：不渲染 ECharts，直接铺小卡片 -->
    <div v-if="chart.type === 'card'" class="stat-chart__cards">
      <div v-for="item in cardItems" :key="item.id" class="mini-card">
        <div class="mini-card__value">
          {{ formatNumber(item.value) }}<span v-if="item.unit" class="mini-card__unit">{{ item.unit }}</span>
        </div>
        <div class="mini-card__label">
          {{ item.label }}<span v-if="item.year" class="mini-card__year"> · {{ item.year }}</span>
        </div>
      </div>
    </div>

    <!-- 其余类型统一交给 ECharts -->
    <BaseChart v-else :option="option" :height="chart.type === 'line' ? '320px' : '340px'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseChart from './BaseChart.vue'
import type {
  ChartData,
  CardChartData,
  PieChartData,
  BarChartData,
  LineChartData,
} from '@/data/statData'

const props = defineProps<{
  chart: ChartData
  color: string
}>()

function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const cardItems = computed(() => (props.chart.data as CardChartData).items)

/* ---------- 颜色工具：以群体强调色为主色，生成同色系深浅 ---------- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(hex: string, target: [number, number, number], t: number): string {
  const [r, g, b] = hexToRgb(hex)
  const R = Math.round(r + (target[0] - r) * t)
  const G = Math.round(g + (target[1] - g) * t)
  const B = Math.round(b + (target[2] - b) * t)
  return `rgb(${R}, ${G}, ${B})`
}
/** 由深到浅的同色系调色板 */
function palette(base: string, n: number): string[] {
  const arr: string[] = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.15 : 0.12 + (i / (n - 1)) * 0.72
    arr.push(mix(base, [255, 255, 255], t))
  }
  return arr
}
function lighten(base: string, t: number): string {
  return mix(base, [255, 255, 255], t)
}

const option = computed<EChartsOption>(() => {
  const c = props.chart
  const color = props.color

  if (c.type === 'pie') {
    const d = c.data as PieChartData
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { type: 'scroll', bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
          data: d.items.map((i) => ({ name: i.name, value: i.value })),
          color: palette(color, d.items.length),
        },
      ],
    }
  }

  if (c.type === 'bar') {
    const d = c.data as BarChartData
    const horizontal = !!d.horizontal
    const names = d.items.map((i) => i.name)
    const values = d.items.map((i) => i.value)
    const unit = d.unit ?? ''
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p: unknown) => {
          const it = (Array.isArray(p) ? p[0] : p) as { name: string; value: number }
          return `${it.name}<br/>${formatNumber(it.value)}${unit}`
        },
      },
      grid: horizontal
        ? { left: 8, right: 36, top: 12, bottom: 8, containLabel: true }
        : { left: 8, right: 18, top: 24, bottom: 8, containLabel: true },
      xAxis: horizontal
        ? { type: 'value', axisLabel: { fontSize: 11 } }
        : {
            type: 'category',
            data: names,
            axisLabel: { interval: 0, rotate: names.length > 4 ? 26 : 0, fontSize: 11, hideOverlap: true },
          },
      yAxis: horizontal
        ? { type: 'category', data: names, axisLabel: { fontSize: 11 } }
        : { type: 'value', axisLabel: { formatter: `{value}${unit}`, fontSize: 11 } },
      series: [
        {
          type: 'bar',
          data: values,
          barWidth: '52%',
          itemStyle: { color, borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
          label: { show: true, position: horizontal ? 'right' : 'top', fontSize: 11, color: '#475569' },
        },
      ],
    }
  }

  if (c.type === 'line') {
    const d = c.data as LineChartData
    const seriesColors =
      d.series.length > 1 ? [color, lighten(color, 0.45)] : [color]
    return {
      tooltip: { trigger: 'axis' },
      legend: d.series.length > 1 ? { bottom: 0, textStyle: { fontSize: 11 } } : undefined,
      grid: {
        left: 8,
        right: 18,
        top: 20,
        bottom: d.series.length > 1 ? 36 : 12,
        containLabel: true,
      },
      xAxis: { type: 'category', boundaryGap: false, data: d.x, axisLabel: { fontSize: 11 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
      series: d.series.map((s, i) => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 3, color: seriesColors[i] },
        itemStyle: { color: seriesColors[i] },
        areaStyle: i === 0 ? { color: lighten(color, 0.8), opacity: 0.45 } : undefined,
      })),
    }
  }

  // progress 等未使用类型，返回空配置占位
  return {}
})
</script>

<style scoped>
.stat-chart {
  width: 100%;
}
.stat-chart__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 4px 2px 6px;
}
.mini-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
}
.mini-card__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.mini-card__unit {
  font-size: 13px;
  font-weight: 500;
  margin-left: 3px;
  color: var(--text-secondary);
}
.mini-card__label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.mini-card__year {
  color: #94a3b8;
  font-size: 11px;
}
@media (min-width: 1280px) {
  .stat-chart__cards {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
