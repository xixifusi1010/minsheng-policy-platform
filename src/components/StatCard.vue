<template>
  <el-card class="stat-card" shadow="hover" :body-style="{ padding: '18px 20px' }">
    <div class="stat-card__inner">
      <div class="stat-card__icon" :style="{ backgroundColor: color + '1a', color }">
        <el-icon :size="26"><component :is="icon" /></el-icon>
      </div>
      <div class="stat-card__content">
        <div class="stat-card__label">{{ label }}</div>
        <div class="stat-card__value">
          <span class="num" :style="{ color }">{{ formattedValue }}</span>
          <span class="unit">{{ unit }}</span>
        </div>
        <div v-if="trend" class="stat-card__trend">{{ trend }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    unit: string
    icon: string
    color: string
    trend?: string
    /** 数值保留小数位 */
    decimals?: number
  }>(),
  { decimals: 0 },
)

const formattedValue = computed(() => {
  return props.value.toLocaleString('zh-CN', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  })
})
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  border: none;
}
.stat-card__inner {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-card__label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.stat-card__value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.stat-card__value .num {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}
.stat-card__value .unit {
  font-size: 13px;
  color: var(--text-secondary);
}
.stat-card__trend {
  margin-top: 6px;
  font-size: 12px;
  color: #10b981;
}
</style>
