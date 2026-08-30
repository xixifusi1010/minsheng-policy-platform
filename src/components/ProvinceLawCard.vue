<template>
  <el-card
    class="law-card"
    :class="{ 'law-card--active': active }"
    shadow="hover"
    :body-style="{ padding: '0' }"
  >
    <!-- 顶部色带：省名 + 类别（点击卡片任意处触发 select，交由父级决定行为） -->
    <div class="law-card__top" @click="$emit('select', data.geoName)">
      <div class="law-card__name">
        <span class="law-card__geo">{{ data.geoName }}</span>
        <span class="law-card__short">{{ data.shortName }}</span>
      </div>
      <el-tag size="small" effect="plain" round>{{ data.category }}</el-tag>
    </div>

    <div class="law-card__body" @click="$emit('select', data.geoName)">
      <!-- HERO：独生子女父母护理假天数 -->
      <div class="hero">
        <template v-if="data.values.careLeaveDays != null">
          <div class="hero__num">{{ data.values.careLeaveDays }}</div>
          <div class="hero__unit">
            <div class="hero__label">独生子女父母护理假</div>
            <div class="hero__sub">
              天 / 年
              <el-tag
                v-if="data.values.careLeavePaid != null"
                size="small"
                :type="data.values.careLeavePaid ? 'success' : 'warning'"
                effect="dark"
                round
              >
                {{ data.values.careLeavePaid ? '带薪' : '不带薪' }}
              </el-tag>
              <el-tag v-else size="small" type="info" effect="plain" round>
                未明确是否带薪
              </el-tag>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="hero__num hero__num--na">
            {{ heroFallback.icon }}
          </div>
          <div class="hero__unit">
            <div class="hero__label">独生子女父母护理假</div>
            <div class="hero__sub hero__sub--na">{{ heroFallback.text }}</div>
          </div>
        </template>
      </div>

      <!-- 核心维度网格 -->
      <div class="grid">
        <div
          v-for="d in coreDims"
          :key="d.key"
          class="cell"
          :title="d.extractRule"
        >
          <div class="cell__label">{{ d.label }}</div>
          <div class="cell__value" :class="valueClass(data.values[d.key])">
            <template v-if="d.type === 'boolean'">
              <span class="dot" />{{ fmt(d, data.values[d.key]) }}
            </template>
            <template v-else>{{ fmt(d, data.values[d.key]) }}</template>
          </div>
        </div>
      </div>

      <!--
        更多维度：直接展开显示，不用折叠。
        原先的 el-collapse 会吃掉点击（展开时容易被外层卡片的跳转逻辑带到地图页），
        直接平铺既省一次点击，也不会和「点卡片跳地图」打架。
      -->
      <div v-if="showMoreSection && moreDims.length" class="more">
        <div class="more__title">更多维度</div>
        <div class="grid">
          <div v-for="d in moreDims" :key="d.key" class="cell">
            <div class="cell__label">{{ d.label }}</div>
            <div class="cell__value" :class="valueClass(data.values[d.key])">
              <template v-if="d.type === 'boolean'">
                <span class="dot" />{{ fmt(d, data.values[d.key]) }}
              </template>
              <template v-else>{{ fmt(d, data.values[d.key]) }}</template>
            </div>
          </div>
        </div>
      </div>

      <!-- 无原文数据的提示 -->
      <el-alert
        v-if="!data.docFiles.length"
        class="no-data"
        type="info"
        :closable="false"
        show-icon
        title="该行政区原文为扫描件或术语体系不同，未提取到可对比字段"
      />

      <!-- 特殊情况说明（港澳台等）：解释某些维度为何为空 -->
      <p v-if="data.note" class="law-card__note">
        <el-icon><InfoFilled /></el-icon>{{ data.note }}
      </p>

      <!-- 底部：依据文件 + 操作 -->
      <div class="law-card__foot">
        <span class="src" :title="data.sourceDoc">
          <el-icon><Document /></el-icon>
          {{ data.sourceDoc || '无原文' }}
        </span>
        <!--
          关键：@click.stop 加在 el-button 上拦的是「组件自定义事件」，
          原生 DOM 事件此时已经冒泡完毕，外层卡片的点击照样会触发。
          所以这里用原生 <span @click.stop> 包一层，真正拦住原生冒泡。
        -->
        <div class="ops" @click.stop>
          <el-button
            v-if="showCompare"
            size="small"
            text
            type="primary"
            @click="$emit('add-compare', data.geoName)"
          >
            <el-icon><Plus /></el-icon>对比
          </el-button>
          <el-button v-if="closable" size="small" text @click="$emit('close')">
            <el-icon><Close /></el-icon>关闭
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close, Document, InfoFilled, Plus } from '@element-plus/icons-vue'
import { careLeaveStatusText, dimensions } from '@/data/elderlyLawData'
import type { DimValue, DimensionMeta, ProvinceLawData } from '@/types'

const props = withDefaults(
  defineProps<{
    data: ProvinceLawData
    /** 紧凑模式：只显示核心维度，不显示更多维度折叠区 */
    compact?: boolean
    /** 是否高亮（地图联动选中态） */
    active?: boolean
    /** 是否显示关闭按钮 */
    closable?: boolean
    /**
     * 是否显示「对比」按钮。
     * 地图页只做"点击看卡片"，对比功能统一收在法规对比页，故地图页传 false。
     */
    showCompare?: boolean
    /**
     * 是否显示更多维度折叠区。
     * 法规对比页网格需要详细对比时设为 true。
     */
    expandMore?: boolean
  }>(),
  { compact: false, active: false, closable: false, showCompare: true, expandMore: false },
)

/** 更多维度是否显示：地图页（compact=false）默认展开，对比页网格按需显式开启 */
const showMoreSection = computed(() => !props.compact || props.expandMore)

defineEmits<{
  (e: 'add-compare', geoName: string): void
  (e: 'select', geoName: string): void
  (e: 'close'): void
}>()

const coreDims = computed(() =>
  dimensions.filter((d) => d.group === 'core' && d.key !== 'careLeaveDays'),
)
const moreDims = computed(() => dimensions.filter((d) => d.group === 'more'))

/** 护理假无明确天数时的兜底展示 */
const heroFallback = computed(() => {
  const st = props.data.values.careLeaveStatus ?? 'none'
  if (st === 'timeonly') return { icon: '∞', text: '仅规定陪护时间，未明确天数' }
  if (st === 'none') return { icon: '—', text: careLeaveStatusText.none }
  return { icon: '—', text: '未规定' }
})

function fmt(d: DimensionMeta, v: DimValue): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? '有' : '无'
  return d.unit ? `${v} ${d.unit}` : String(v)
}

function valueClass(v: DimValue) {
  if (v === null || v === undefined || v === '') return 'is-na'
  if (typeof v === 'boolean') return v ? 'is-yes' : 'is-no'
  return ''
}
</script>

<style scoped>
.law-card {
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.law-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.law-card--active {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.18);
}

.law-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(245, 158, 11, 0.08);
}
.law-card__geo {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}
.law-card__short {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 6px;
}
.law-card__body {
  padding: 16px;
}

/* HERO */
.hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0 14px;
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--border-color);
}
.hero__num {
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  color: #f59e0b;
  letter-spacing: -1px;
}
.hero__num--na {
  font-size: 30px;
  color: var(--text-secondary);
  font-weight: 600;
}
.hero__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.hero__sub {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.hero__sub--na {
  color: var(--text-secondary);
}

/* 维度网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}
.cell {
  min-width: 0;
}
.cell__label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell__value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 5px;
}
.cell__value.is-na {
  font-weight: 400;
  color: #9ca3af;
}
.cell__value.is-yes {
  color: #10b981;
}
.cell__value.is-no {
  color: #9ca3af;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex: 0 0 auto;
}

.more {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}
.more__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}
.no-data {
  margin-top: 14px;
}
.law-card__note {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin: 14px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  font-size: 12px;
  line-height: 1.6;
  color: #92400e;
}
.law-card__note .el-icon {
  flex: 0 0 auto;
  margin-top: 2px;
}

.law-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}
.src {
  font-size: 12px;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ops {
  flex: 0 0 auto;
  display: flex;
  gap: 2px;
}
</style>
