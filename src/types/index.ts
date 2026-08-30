// 民生政策相关的类型定义

/** 适用群体（三大重点群体） */
export type TargetGroup = 'elderly' | 'disabled' | 'children'

/** 政策行政级别 */
export type PolicyLevel = '国家级' | '省级' | '市级'

/** 政策状态 */
export type PolicyStatus = 'active' | 'expired' | 'draft'

/** 单条政策记录 */
export interface Policy {
  /** 唯一 ID */
  id: string
  /** 政策标题 */
  title: string
  /** 政策摘要 */
  summary: string
  /** 政策原文（可选） */
  fullText?: string
  /** 原文链接 */
  sourceUrl: string
  /** 发布日期 yyyy-MM 或 yyyy-MM-dd */
  publishDate: string
  /** 发文部门 */
  department: string
  /** 适用群体 */
  targetGroup: TargetGroup
  /** 适用地区（须与地图 GeoJSON 名称一致，如「广东省」「北京市」；「国家级」表示全国层面） */
  region: string
  /** 行政级别 */
  level: PolicyLevel
  /** 政策类型标签 */
  policyType: string[]
  /** 其他标签 */
  tags?: string[]
  /** 预算金额（亿元，可选） */
  budget?: number
  /** 预计受益人数（万人，可选） */
  beneficiaries?: number
  /** 政策状态 */
  status: PolicyStatus
}

/** 群体元数据：用于侧边栏、首页入口卡片与图表着色 */
export interface GroupMeta {
  /** 群体标识 */
  key: TargetGroup
  /** 群体中文名（老年人 / 残疾人 / 儿童） */
  label: string
  /** 分类名（养老服务 / 残疾人保障 / 儿童关爱） */
  categoryLabel: string
  /** 强调色 */
  color: string
  /** Element Plus 图标名 */
  icon: string
}

/** 群体统计（用于饼图 / 卡片） */
export interface GroupStat {
  /** 群体标识 */
  key: TargetGroup
  /** 显示名称（分类名） */
  name: string
  /** 数量 */
  value: number
  /** 强调色 */
  color: string
}

/** 顶部统计卡片数据 */
export interface StatItem {
  /** 指标名称 */
  label: string
  /** 数值 */
  value: number
  /** 单位 */
  unit: string
  /** Element Plus 图标组件名 */
  icon: string
  /** 主题色 */
  color: string
  /** 同比/环比描述 */
  trend?: string
}

/** 名称-数值 结构，用于柱状图 / 地图 */
export interface NameValue {
  name: string
  value: number
}

/** 年度趋势点 */
export interface YearPoint {
  year: string
  count: number
  budget: number
}

/* ==================== 老年人权益保障法规对比 ==================== */

/** 维度取值类型 */
export type DimValue = number | boolean | string | null

/** 维度类型：数值 / 布尔 / 文本 */
export type DimType = 'number' | 'boolean' | 'text'

/** 维度分组：核心卡 / 更多维度 */
export type DimGroup = 'core' | 'more'

/** 对比维度元数据：驱动卡片渲染、排序、筛选、地图着色 */
export interface DimensionMeta {
  /** 数据字段名 */
  key: string
  /** 展示名称 */
  label: string
  /** 值类型 */
  type: DimType
  /** 单位，如 天/年、周岁 */
  unit?: string
  /** 分组：core 进主卡，more 进折叠区 */
  group: DimGroup
  /** 排序语义：true 表示值越大越好（如护理假天数），false 表示越小越好（如优待起始年龄） */
  higherIsBetter?: boolean
  /** Element Plus 图标名 */
  icon?: string
  /** 数据提取规则说明 */
  extractRule?: string
}

/** 护理假在法规中的落地状态 */
export type CareLeaveStatus = 'explicit' | 'timeonly' | 'none'

/** 单个省份的老年人权益保障法规对比数据 */
export interface ProvinceLawData {
  /** GeoJSON 全称，同时是 assets 文件夹名与查表键 */
  geoName: string
  /** 展示简称，如 内蒙古 */
  shortName: string
  /** 行政区类别 */
  category: '省' | '自治区' | '直辖市' | '特别行政区'
  /** 主要依据文件 */
  sourceDoc: string
  /** 该省全部原文文件 */
  docFiles: string[]
  /**
   * 特殊情况说明（港澳台等）。
   * 用于解释某些维度为何为空——并非"当地没有该福利"，而是原文范围或可解析性所致。
   */
  note?: string
  /** 维度取值（缺失为 null，卡片显示「—」） */
  values: Record<string, DimValue> & {
    careLeaveDays?: number | null
    careLeavePaid?: boolean | null
    careLeaveStatus?: CareLeaveStatus
    careLeaveGeneralDays?: number | null
  }
}
