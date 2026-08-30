<template>
  <div class="dashboard">
    <!-- 标题 + 群体 Tab 切换 -->
    <div class="db-header">
      <div class="db-header__text">
        <h2 class="db-title">三大群体民生数据看板</h2>
        <p class="db-subtitle">数据口径截至 2025 年底 · 来源：民政部 / 中国残联 / 国家统计局等公开统计</p>
      </div>

      <div class="db-tabs">
        <button
          v-for="g in groupStats"
          :key="g.group"
          class="db-tab"
          :class="{ active: active === g.group }"
          :style="tabStyle(g)"
          @click="active = g.group"
        >
          <span class="db-tab__dot" :style="{ backgroundColor: g.color }"></span>
          {{ g.groupName }}
        </button>
      </div>
    </div>

    <!-- 内容区：切换群体时整体淡入 -->
    <transition name="fade" mode="out-in">
      <div :key="active" class="db-content">
        <!-- 核心指标卡片 -->
        <div class="db-cards">
          <div
            v-for="card in current.coreCards"
            :key="card.id"
            class="db-card"
            :style="cardAccent(current.color)"
          >
            <div class="db-card__label">
              {{ card.label }}
              <span v-if="card.year" class="db-card__year">{{ card.year }}</span>
            </div>
            <div class="db-card__value">
              {{ formatNumber(card.value) }}<span v-if="card.unit" class="db-card__unit">{{ card.unit }}</span>
            </div>
            <div v-if="card.description" class="db-card__desc">{{ card.description }}</div>
          </div>
        </div>

        <!-- 津补贴细分（仅老年人看板展示） -->
        <div v-if="current.subsidy" class="db-subsidy">
          <div class="db-chart-card__head">
            <span class="db-chart-card__bar" :style="{ backgroundColor: current.color }"></span>
            <h3 class="db-chart-card__title">{{ current.subsidy.title }}</h3>
          </div>
          <div class="db-subsidy__grid">
            <div
              v-for="item in current.subsidy.items"
              :key="item.id"
              class="sub-card"
              :style="cardAccent(current.color)"
            >
              <div class="sub-card__icon" :style="{ color: current.color }">
                <el-icon :size="22"><component :is="subsidyIconMap[item.icon]" /></el-icon>
              </div>
              <div class="sub-card__label">{{ item.label }}</div>
              <div class="sub-card__value" :style="{ color: current.color }">
                {{ formatNumber(item.value) }}<span v-if="item.unit" class="sub-card__unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
          <p class="db-subsidy__note">{{ current.subsidy.sourceNote }}</p>
        </div>

        <!-- 图表网格 -->
        <div class="db-charts">
          <div v-for="chart in current.charts" :key="chart.id" class="db-chart-card">
            <div class="db-chart-card__head">
              <span class="db-chart-card__bar" :style="{ backgroundColor: current.color }"></span>
              <h3 class="db-chart-card__title">{{ chart.title }}</h3>
            </div>
            <StatChart :chart="chart" :color="current.color" />
            <p v-if="chart.note" class="db-chart-card__note">
              <el-icon><InfoFilled /></el-icon>{{ chart.note }}
            </p>
          </div>
        </div>

        <!-- 群体结论 -->
        <div class="db-summary" :style="summaryStyle(current.color)">
          <div class="db-summary__tag" :style="{ backgroundColor: current.color }">
            {{ current.groupName }}
          </div>
          <p class="db-summary__text">{{ current.summary }}</p>
        </div>
      </div>
    </transition>

    <!-- 统一数据来源说明 -->
    <div class="db-source">
      <el-icon><Document /></el-icon>
      <span>
        数据来源：老年人、残疾人数据来自《2025年度公报》；儿童数据来自《2024年度统计监测报告》。
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import { Medal, FirstAidKit, Bowl, Box } from '@element-plus/icons-vue'
import StatChart from '@/components/charts/StatChart.vue'
import { groupStats, type GroupStatData, type SubsidyItem } from '@/data/statData'
import type { TargetGroup } from '@/types'

/** 津补贴图标映射：数据中的字符串 key → 实际 Element Plus 图标组件 */
const subsidyIconMap: Record<SubsidyItem['icon'], Component> = {
  Medal,
  FirstAidKit,
  Bowl,
  Box,
}

const active = ref<TargetGroup>('elderly')

const current = computed<GroupStatData>(
  () => groupStats.find((g) => g.group === active.value) ?? groupStats[0],
)

function formatNumber(n: number): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function tabStyle(g: GroupStatData) {
  const isActive = active.value === g.group
  return isActive
    ? {
        color: g.color,
        borderColor: g.color,
        background: hexToRgba(g.color, 0.1),
        fontWeight: '600',
      }
    : {}
}

function cardAccent(color: string) {
  return {
    borderTop: `3px solid ${color}`,
    boxShadow: `0 2px 10px ${hexToRgba(color, 0.12)}`,
  }
}

function summaryStyle(color: string) {
  return {
    borderLeft: `4px solid ${color}`,
    background: hexToRgba(color, 0.06),
  }
}

/** 将 #RRGGBB 转为带透明度的 rgba */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
.dashboard {
  padding: 22px 26px 30px;
  max-width: 1320px;
  margin: 0 auto;
}
.db-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.db-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}
.db-subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}
.db-tabs {
  display: flex;
  gap: 10px;
}
.db-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: #fff;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.18s ease;
}
.db-tab:hover {
  border-color: #cbd5e1;
}
.db-tab__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.db-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}
.db-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px 20px;
}
.db-card__label {
  font-size: 13px;
  color: var(--text-secondary);
}
.db-card__value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
}
.db-card__unit {
  font-size: 14px;
  font-weight: 500;
  margin-left: 4px;
  color: var(--text-secondary);
}
.db-card__desc {
  margin-top: 6px;
  font-size: 12px;
  color: var(--brand);
}
.db-card__year {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 11px;
  color: var(--text-secondary);
  background: #eef2f7;
  border-radius: 4px;
  vertical-align: middle;
}

.db-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.db-chart-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px 18px 14px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}
.db-chart-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.db-chart-card__bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
}
.db-chart-card__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}
.db-chart-card__note {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 2px 0;
  font-size: 12px;
  color: var(--text-secondary);
}
.db-chart-card__note .el-icon {
  color: var(--brand);
}

/* 津补贴细分卡片组 */
.db-subsidy {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px 18px 14px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
  margin-bottom: 18px;
}
.db-subsidy__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 12px;
}
.sub-card {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px 16px;
  text-align: center;
}
.sub-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.sub-card__label {
  font-size: 13px;
  color: var(--text-secondary);
}
.sub-card__value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
}
.sub-card__unit {
  font-size: 13px;
  font-weight: 500;
  margin-left: 4px;
  color: var(--text-secondary);
}
.db-subsidy__note {
  margin: 12px 2px 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.db-summary {
  margin-top: 18px;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.db-summary__tag {
  flex-shrink: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}
.db-summary__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* 响应式：津补贴卡片 <768px 变 2x2 */
@media (max-width: 768px) {
  .db-subsidy__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 响应式：平板 2x2，手机单列 */
@media (max-width: 1024px) {
  .db-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .db-charts {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .dashboard {
    padding: 16px 14px 24px;
  }
  .db-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

.db-source {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  border-top: 1px dashed var(--border-color);
  padding-top: 14px;
}
.db-source .el-icon {
  font-size: 14px;
  color: var(--brand);
}
</style>
