import type { TargetGroup } from '@/types'

/**
 * 三大群体民生统计看板数据
 * 数据口径：截至 2025 年底（部分为「十四五」累计值）
 * 来源：民政部、中国残联、国家统计局等公开统计
 */

/** 单个统计指标 */
export interface StatItem {
  id: string
  label: string
  value: number
  unit?: string
  year?: string
  description?: string
}

export type ChartKind = 'pie' | 'bar' | 'line' | 'progress' | 'card'

/* ---------- 各图表 data 的具体结构（替代 any，保证类型完备） ---------- */

export interface PieDatum {
  name: string
  value: number
}
export interface BarDatum {
  name: string
  value: number
}
export interface LineSeries {
  name: string
  data: number[]
}
export interface PieChartData {
  items: PieDatum[]
}
export interface BarChartData {
  /** 是否为横向条形图 */
  horizontal?: boolean
  unit?: string
  items: BarDatum[]
}
export interface LineChartData {
  x: string[]
  series: LineSeries[]
}
export interface CardChartData {
  items: StatItem[]
}

export type ChartPayload =
  | PieChartData
  | BarChartData
  | LineChartData
  | CardChartData

/** 图表数据集 */
export interface ChartData {
  id: string
  title: string
  type: ChartKind
  data: ChartPayload
  group: TargetGroup
  /** 图表底部补充说明（如趋势注解） */
  note?: string
}

/** 津补贴细分卡片项（老年人看板专属） */
export interface SubsidyItem {
  id: string
  label: string
  value: number
  unit?: string
  /** Element Plus 图标组件名，在视图中映射为实际组件 */
  icon: 'Medal' | 'FirstAidKit' | 'Bowl' | 'Box'
}

/** 群体统计数据 */
export interface GroupStatData {
  group: TargetGroup
  groupName: string
  color: string
  summary: string
  coreCards: StatItem[]
  charts: ChartData[]
  /** 数据来源说明（如《2025年度公报》） */
  source: string
  /** 津补贴细分（仅老年人看板展示） */
  subsidy?: {
    title: string
    items: SubsidyItem[]
    sourceNote: string
  }
}

/* ============================== 老年人 ============================== */

const elderly: GroupStatData = {
  group: 'elderly',
  groupName: '老年人',
  color: '#F59E0B',
  source: '《2025年度公报》',
  subsidy: {
    title: '津补贴细分',
    items: [
      { id: 's-gaoling', label: '高龄津贴', value: 4145.9, unit: '万人', icon: 'Medal' },
      { id: 's-huli', label: '护理补贴', value: 91.6, unit: '万人', icon: 'FirstAidKit' },
      { id: 's-yanglao', label: '养老服务补贴', value: 585.8, unit: '万人', icon: 'Bowl' },
      { id: 's-zonghe', label: '综合补贴', value: 530.5, unit: '万人', icon: 'Box' },
    ],
    sourceNote: '数据来源：《2024年度国家老龄事业发展公报》',
  },
  summary:
    '2025年，我国60岁及以上老年人口达3.23亿，占总人口23.0%。基本养老保险覆盖10.76亿人，各级财政养老支出约1200亿元。养老设施达39.5万个，但养老床位连续三年下降至767.9万张，供需结构性矛盾仍需关注。长期护理保险参保超3亿人，但实际享受待遇不足200万人，覆盖面有待扩大。',
  coreCards: [
    { id: 'e-pop', label: '老年人口', value: 32338, unit: '万人', description: '占总人口 23.0%' },
    { id: 'e-insure', label: '基本养老保险参保', value: 107591, unit: '万人', description: '约 10.76 亿人' },
    { id: 'e-facility', label: '养老机构 / 设施', value: 39.5, unit: '万个' },
    { id: 'e-fund', label: '年财政养老投入', value: 1200, unit: '亿元' },
  ],
  charts: [
    {
      id: 'e-bar-system',
      title: '养老服务体系分类',
      type: 'bar',
      group: 'elderly',
      data: {
        unit: '个',
        items: [
          { name: '养老机构和设施', value: 395000 },
          { name: '老年助餐点', value: 80000 },
          { name: '医养结合机构', value: 8289 },
          { name: '乡镇/街道区域养老服务中心', value: 20500 },
          { name: '县级公办养老机构', value: 4730 },
        ],
      },
    },
    {
      id: 'e-bar-ltci',
      title: '长期护理保险：参保 vs 享受',
      type: 'bar',
      group: 'elderly',
      data: {
        unit: '万人',
        items: [
          { name: '参保人数', value: 30854.76 },
          { name: '享受待遇人数', value: 192.91 },
        ],
      },
    },
    {
      id: 'e-card-service',
      title: '关键服务数据',
      type: 'card',
      group: 'elderly',
      data: {
        items: [
          { id: 'e-c1', label: '护理型床位占比', value: 69.9, unit: '%' },
          { id: 'e-c2', label: '养老服务从业人员', value: 139.5, unit: '万人' },
          { id: 'e-c3', label: '家庭养老床位（十四五累计）', value: 57, unit: '万张' },
          { id: 'e-c4', label: '适老化改造（十四五累计）', value: 224, unit: '万户' },
        ],
      },
    },
    {
      id: 'e-line-beds',
      title: '养老床位历年趋势（万张）',
      type: 'line',
      group: 'elderly',
      note: '养老床位自 2023 年起连续三年下降。',
      data: {
        x: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        series: [
          {
            name: '养老床位',
            data: [660, 680, 700, 720, 740, 760, 770, 780, 775, 767.9],
          },
        ],
      },
    },
  ],
}

/* ============================== 残疾人 ============================== */

const disabled: GroupStatData = {
  group: 'disabled',
  groupName: '残疾人',
  color: '#10B981',
  source: '《2025年度公报》',
  summary:
    '2025年，全国持证残疾人就业人数达891.5万人，城乡新增就业44.8万人。基本康复服务覆盖795.9万人，康复机构达13596个。残疾人基本医疗保险参保率超过95%，2760余万人参加城乡居民养老保险。就业结构以农村种养加和灵活就业为主，占比超75%，按比例就业仍有较大提升空间。',
  coreCards: [
    { id: 'd-employ', label: '持证就业人数', value: 891.5, unit: '万人', description: '城乡新增就业 44.8 万人' },
    { id: 'd-rehab', label: '基本康复服务', value: 795.9, unit: '万人' },
    { id: 'd-org', label: '康复机构', value: 13596, unit: '个' },
    { id: 'd-insure', label: '基本医保参保率', value: 95, unit: '%', description: '覆盖率超过 95%' },
  ],
  charts: [
    {
      id: 'd-pie-employ',
      title: '就业结构（万人）',
      type: 'pie',
      group: 'disabled',
      data: {
        items: [
          { name: '按比例就业', value: 100.4 },
          { name: '集中就业', value: 21.3 },
          { name: '个体就业', value: 58.0 },
          { name: '公益性岗位', value: 18.2 },
          { name: '辅助性就业', value: 15.8 },
          { name: '灵活就业', value: 275.4 },
          { name: '农村种养加', value: 402.4 },
        ],
      },
    },
    {
      id: 'd-bar-rehab',
      title: '康复服务分类（万人）',
      type: 'bar',
      group: 'disabled',
      data: {
        unit: '万人',
        items: [
          { name: '基本康复服务', value: 795.9 },
          { name: '辅助器具适配', value: 148.7 },
          { name: '残疾儿童康复救助', value: 51.3 },
          { name: '自助互助康复服务', value: 40.3 },
        ],
      },
    },
    {
      id: 'd-bar-type',
      title: '接受康复服务的残疾人类型（万人）',
      type: 'bar',
      group: 'disabled',
      data: {
        horizontal: true,
        unit: '万人',
        items: [
          { name: '肢体残疾人', value: 364.6 },
          { name: '精神残疾人', value: 152.8 },
          { name: '智力残疾人', value: 66.3 },
          { name: '听力残疾人', value: 65.3 },
          { name: '视力残疾人', value: 60.1 },
          { name: '多重残疾人', value: 54.7 },
          { name: '言语残疾人', value: 5.5 },
        ],
      },
    },
    {
      id: 'd-card-security',
      title: '残疾人保障关键数据',
      type: 'card',
      group: 'disabled',
      data: {
        items: [
          { id: 'd-c1', label: '参加城乡居民养老保险', value: 2773.7, unit: '万人' },
          { id: 'd-c2', label: '领取养老金', value: 1296.1, unit: '万人' },
          { id: 'd-c3', label: '托养服务机构', value: 11210, unit: '个' },
          { id: 'd-c4', label: '就业帮扶基地', value: 2898, unit: '个' },
        ],
      },
    },
  ],
}

/* ============================== 儿童 ============================== */

const children: GroupStatData = {
  group: 'children',
  groupName: '儿童',
  color: '#EC4899',
  source: '《2024年度统计监测报告》',
  summary:
    '截至2025年底，全国共保障孤儿11.9万名、事实无人抚养儿童44.5万名。集中养育孤儿平均保障标准达2069.9元/月。基层儿童服务队伍持续壮大，儿童主任达58.3万人，乡镇级未保站超2万家。新生儿死亡率降至2.5‰，儿童健康水平持续改善，但心理健康服务资源配置仍待加强。',
  coreCards: [
    { id: 'c-orphan', label: '保障孤儿', value: 11.9, unit: '万人' },
    { id: 'c-fact', label: '事实无人抚养儿童', value: 44.5, unit: '万人' },
    { id: 'c-director', label: '儿童主任', value: 58.3, unit: '万人' },
    { id: 'c-home', label: '儿童之家', value: 33.8, unit: '万个', year: '2024' },
  ],
  charts: [
    {
      id: 'c-bar-standard',
      title: '三类保障对象保障标准（元/人/月）',
      type: 'bar',
      group: 'children',
      data: {
        unit: '元',
        items: [
          { name: '集中养育孤儿', value: 2069.9 },
          { name: '社会散居孤儿', value: 1606.8 },
          { name: '事实无人抚养儿童', value: 1593.4 },
        ],
      },
    },
    {
      id: 'c-bar-force',
      title: '基层儿童服务力量',
      type: 'bar',
      group: 'children',
      note: '数据年份：2024 年（含儿童福利机构 443 个）',
      data: {
        items: [
          { name: '儿童督导员', value: 4.2, unit: '万人' },
          { name: '儿童主任', value: 58.3, unit: '万人' },
          { name: '未成年人保护工作站', value: 2, unit: '万个' },
          { name: '儿童福利机构', value: 443, unit: '个' },
          { name: '城乡社区儿童之家', value: 33.8, unit: '万个' },
        ].map(({ name, value }) => ({ name, value })),
      },
    },
    {
      id: 'c-line-trend',
      title: '儿童福利保障趋势（万人）',
      type: 'line',
      group: 'children',
      data: {
        x: ['2021', '2022', '2023', '2024', '2025'],
        series: [
          { name: '孤儿', data: [19, 17, 15, 13, 11.9] },
          { name: '事实无人抚养儿童', data: [41, 43, 44, 44, 44.5] },
        ],
      },
    },
    {
      id: 'c-card-health',
      title: '儿童健康核心指标',
      type: 'card',
      group: 'children',
      data: {
        items: [
          { id: 'c-h1', label: '新生儿死亡率', value: 2.5, unit: '‰' },
          { id: 'c-h2', label: '婴儿死亡率', value: 4.0, unit: '‰' },
          { id: 'c-h3', label: '5岁以下儿童死亡率', value: 5.6, unit: '‰' },
          { id: 'c-h4', label: '中小学生体质健康优良率', value: 56.9, unit: '%' },
        ],
      },
    },
  ],
}

export const groupStats: GroupStatData[] = [elderly, disabled, children]

export const groupStatByKey: Record<TargetGroup, GroupStatData> = {
  elderly,
  disabled,
  children,
}
