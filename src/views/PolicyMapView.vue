<template>
  <div class="page-container">
    <h2 class="section-title">老年人权益保障法规 · 地图</h2>

    <el-alert class="disclaimer" type="warning" :closable="false" show-icon>
      <template #title>地图与数据声明</template>
      地图按中国现行行政区划着色：香港、澳门为特别行政区，台湾是中国不可分割的一部分。颜色深浅仅为技术可视化示意，不代表官方评价；数据由脚本自动抽取，仅供学习参考，所收录法规不全面、仍待核对。
    </el-alert>

    <el-row :gutter="16">
      <el-col :xs="24" :md="15">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-head">
              <span>全国分布 · 点击省份查看法规对比卡</span>
              <el-select
                v-model="metric"
                size="small"
                class="metric-select"
                placeholder="着色指标"
              >
                <el-option label="综合福利指数" value="welfareIndex" />
                <el-option label="独生子女护理假天数" value="careLeaveDays" />
                <el-option label="高龄津贴起始年龄" value="highAgeAllowanceAge" />
                <el-option label="免费乘公交年龄" value="freeTransitAge" />
                <el-option label="免费进公园景区年龄" value="freeParkAge" />
                <el-option label="老年人定义年龄" value="elderlyDefAge" />
              </el-select>
            </div>
          </template>
          <PolicyMap
            :data="mapData"
            :selected="selected"
            :value-name="metricLabel"
            :value-unit="metricUnit"
            @select="onSelect"
          />
          <p class="map-tip">
            <el-icon><InfoFilled /></el-icon>
            颜色越深表示该省在所选指标下福利越完善/优待越宽松（0 表示无原文数据）。
            详细对比、排序与对比栏见左侧
            <el-link type="primary" :underline="false" @click="$router.push('/elderly-law')">
              「法规对比」
            </el-link>
            页。
          </p>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="9">
        <div v-if="selectedData" class="detail-panel">
          <!-- 地图页只负责"点击看卡片"，对比按钮收在法规对比页，故 show-compare=false -->
          <ProvinceLawCard
            :data="selectedData"
            :active="true"
            :closable="true"
            :show-compare="false"
            @close="selected = null"
          />
        </div>
        <el-card v-else class="detail-placeholder" shadow="never">
          <el-empty description="点击地图中的省份，在此查看该省法规对比卡片" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { InfoFilled } from '@element-plus/icons-vue'
import PolicyMap from '@/components/charts/PolicyMap.vue'
import ProvinceLawCard from '@/components/ProvinceLawCard.vue'
import { dimensions, elderlyLawByGeo, provinces } from '@/data/elderlyLawData'
import type { ProvinceLawData } from '@/types'

const route = useRoute()

const metric = ref('welfareIndex')
const selected = ref<string | null>(null)

const metricMeta = computed(() => {
  const d = dimensions.find((x) => x.key === metric.value)
  return { label: d?.label ?? '指标', unit: d?.unit ?? '' }
})
const metricLabel = computed(() => metricMeta.value.label)
const metricUnit = computed(() => metricMeta.value.unit)

/**
 * 地图数据：null 全部转为 0，让 34 省全部着色、没有灰色区域；
 * 0 在视觉上表示「本法规未规定」，由页脚说明文字解释。
 */
const mapData = computed<Array<{ name: string; value: number | null }>>(() =>
  provinces.map((p) => {
    const raw = p.values[metric.value]
    const v = typeof raw === 'number' ? raw : null
    return { name: p.geoName, value: v == null ? 0 : v }
  }),
)

const selectedData = computed<ProvinceLawData | null>(() =>
  selected.value ? elderlyLawByGeo[selected.value] ?? null : null,
)

function onSelect(geoName: string) {
  selected.value = geoName || null
}
// 注意：对比功能集中在「法规对比」页，地图页不再提供加入对比

// 支持从「法规对比」页 ?geo=xxx 跳转过来时自动选中
function applyRouteGeo(q: unknown) {
  if (typeof q === 'string' && elderlyLawByGeo[q]) selected.value = q
}
onMounted(() => applyRouteGeo(route.query.geo))
watch(() => route.query.geo, applyRouteGeo)
</script>

<style scoped>
.disclaimer {
  margin-bottom: 16px;
}
.chart-card,
.detail-placeholder {
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.metric-select {
  width: 180px;
}
.map-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}
.detail-panel {
  position: sticky;
  top: 16px;
}
</style>
