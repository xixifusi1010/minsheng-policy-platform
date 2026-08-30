<template>
  <div class="page-container">
    <!-- 悬浮返回顶部：向下浏览出现，点了回顶部看对比栏 -->
    <el-backtop
      target=".app-main"
      :visibility-height="300"
      :right="36"
      :bottom="60"
    >
      <div class="backtop">
        <el-icon><Top /></el-icon>
        <span>顶部</span>
      </div>
    </el-backtop>

    <h2 class="section-title">老年人权益保障法规 · 横向对比</h2>

    <el-alert class="disclaimer" type="warning" :closable="false" show-icon>
      <template #title>数据与主权声明</template>
      本站数据由脚本从法规原文自动抽取，<b>仅供技术学习参考</b>；所收录法规不全面、仍待核对，不代表官方口径。
      涉及香港、澳门、台湾的内容仅作技术展示——香港、澳门是中华人民共和国的特别行政区，台湾是中国不可分割的一部分。
    </el-alert>

    <!-- 概览统计 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <StatCard
          label="覆盖省级行政区"
          :value="provinces.length"
          unit="个"
          icon="MapLocation"
          color="#2563eb"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          label="护理假最长地区"
          :value="topCareLeaveDays"
          :unit="topCareLeaveName"
          icon="Sunny"
          color="#f59e0b"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          label="已明确护理假天数"
          :value="explicitCount"
          unit="个地区"
          icon="CircleCheck"
          color="#10b981"
        />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard
          label="本法规未规定护理假"
          :value="noneCount"
          unit="个地区"
          icon="Warning"
          color="#ef4444"
        />
      </el-col>
    </el-row>

    <!-- 对比栏 -->
    <el-card v-if="compare.list.length" class="chart-row" shadow="never">
      <template #header>
        <div class="card-head">
          <span>对比栏（{{ compare.list.length }} / {{ compare.max }}）</span>
          <el-button size="small" text type="danger" @click="compare.clear">
            清空
          </el-button>
        </div>
      </template>
      <el-row :gutter="12">
        <el-col
          v-for="g in compare.list"
          :key="g"
          :xs="24"
          :sm="12"
          :md="24 / Math.min(compare.list.length, 4)"
        >
          <!-- 对比栏也要展开更多维度（否则并排对比时看不到全貌）；
               已在对比栏中，故隐藏"对比"按钮，只保留"关闭"移除 -->
          <ProvinceLawCard
            :data="elderlyLawByGeo[g]"
            :compact="true"
            :expand-more="true"
            :show-compare="false"
            :closable="true"
            @close="compare.remove(g)"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 34 省对比网格 -->
    <el-card class="chart-row" shadow="never">
      <template #header>
        <span>34 个省级行政区横向对比（点击卡片 → 地图页查看）</span>
      </template>

      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索省份"
          clearable
          size="default"
          class="tool"
        />
        <el-select v-model="sortKey" size="default" class="tool" placeholder="排序维度">
          <el-option label="默认（行政区划）" value="" />
          <el-option
            v-for="d in sortableDims"
            :key="d.key"
            :label="d.label"
            :value="d.key"
          />
        </el-select>
        <el-select v-model="categoryFilter" size="default" class="tool">
          <el-option label="全部类别" value="" />
          <el-option label="省" value="省" />
          <el-option label="自治区" value="自治区" />
          <el-option label="直辖市" value="直辖市" />
          <el-option label="特别行政区" value="特别行政区" />
        </el-select>
        <el-checkbox v-model="onlyExplicit" class="tool">
          仅显示护理假有明确天数
        </el-checkbox>
      </div>

      <el-row :gutter="16">
        <el-col
          v-for="p in sortedProvinces"
          :key="p.geoName"
          :xs="24"
          :sm="12"
          :lg="8"
          :xl="6"
          class="card-col"
        >
          <!--
            点击卡片本体 → 跳地图页并预选该省；
            点右下角「对比」→ 只加进对比栏 + 滚回顶部。
            卡片内部用原生 <span @click.stop> 拦住 ops 区冒泡，两者互不干扰。
          -->
          <ProvinceLawCard
            :data="p"
            :compact="true"
            :expand-more="true"
            @select="goMap"
            @add-compare="onAddCompare"
          />
        </el-col>
      </el-row>
      <el-empty v-if="!sortedProvinces.length" description="没有符合条件的地区" />
    </el-card>

    <el-alert class="note" type="info" :closable="false" show-icon>
      <template #title>数据说明</template>
      数据由脚本从
      <code>assets/</code>
      下 34 个省级行政区的法规原文自动抽取生成（护理假天数、津贴年龄、优待年龄等）。
      「—」表示该省<b>此份法规原文</b>未明确规定该指标。需注意：部分省份将独生子女护理假规定在
      《人口与计划生育条例》中，未包含在本项目的老年人法规原文内，故显示为未规定。
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Top } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import ProvinceLawCard from '@/components/ProvinceLawCard.vue'
import { dimensions, elderlyLawByGeo, provinces } from '@/data/elderlyLawData'
import { useCompareStore } from '@/stores/compare'

const router = useRouter()
const compare = useCompareStore()

const keyword = ref('')
const sortKey = ref('')
const categoryFilter = ref('')
const onlyExplicit = ref(false)

// ===== 顶部统计 =====
const explicitList = computed(() =>
  provinces.filter((p) => p.values.careLeaveStatus === 'explicit'),
)
const explicitCount = computed(() => explicitList.value.length)
const noneCount = computed(
  () => provinces.filter((p) => p.values.careLeaveStatus === 'none').length,
)
const topCareLeave = computed(() =>
  [...explicitList.value].sort(
    (a, b) => (b.values.careLeaveDays ?? 0) - (a.values.careLeaveDays ?? 0),
  )[0],
)
const topCareLeaveDays = computed(() => topCareLeave.value?.values.careLeaveDays ?? 0)
const topCareLeaveName = computed(() => topCareLeave.value?.shortName ?? '—')

const sortableDims = computed(() => dimensions.filter((d) => d.type === 'number'))

// ===== 筛选 + 排序 =====
const filteredProvinces = computed(() => {
  const kw = keyword.value.trim()
  return provinces.filter((p) => {
    const matchKw = !kw || p.geoName.includes(kw) || p.shortName.includes(kw)
    const matchCat = !categoryFilter.value || p.category === categoryFilter.value
    const matchExp =
      !onlyExplicit.value || p.values.careLeaveStatus === 'explicit'
    return matchKw && matchCat && matchExp
  })
})

const sortedProvinces = computed(() => {
  const list = [...filteredProvinces.value]
  if (!sortKey.value) return list
  const dim = dimensions.find((d) => d.key === sortKey.value)
  const desc = dim?.higherIsBetter ?? true
  return list.sort((a, b) => {
    const va = a.values[sortKey.value]
    const vb = b.values[sortKey.value]
    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'number' && typeof vb === 'number') {
      return desc ? vb - va : va - vb
    }
    return String(va).localeCompare(String(vb), 'zh-CN')
  })
})

function goMap(geo: string) {
  router.push({ path: '/map', query: { geo } })
}

/**
 * 加入对比：只写入共享队列，不做任何自动滚动（避免打断浏览网格时的视线）。
 * 想回去看对比栏时，点右下角悬浮的返回顶部按钮即可。
 */
function onAddCompare(geo: string) {
  compare.add(geo)
}
</script>

<style scoped>
.disclaimer {
  margin-bottom: 16px;
}
.stat-row {
  margin-bottom: 16px;
}
.chart-row {
  margin-bottom: 16px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
/* 悬浮返回顶部按钮 */
.backtop {
  height: 100%;
  width: 100%;
  background: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1.2;
  gap: 1px;
}
.backtop:hover {
  background: #d97706;
}
.backtop .el-icon {
  font-size: 16px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.tool {
  width: 190px;
}
.tool:first-child {
  width: 180px;
}
.card-col {
  margin-bottom: 16px;
}
.note {
  margin-top: 4px;
}
.note code {
  background: #f3f4f6;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
