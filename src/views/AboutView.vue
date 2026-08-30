<template>
  <div class="page-container about">
    <el-card class="about-card" shadow="never">
      <h2 class="about-title">关于民生政策可视化平台</h2>
      <p class="about-desc">
        本平台聚焦<strong>老年人、残疾人、儿童</strong>三大重点群体，围绕养老服务、残疾人保障与儿童关爱，
        将分散的政策文件转化为可感知、可对比、可下钻的可视化数据，
        帮助研究者、决策者与公众快速把握政策投放的结构与趋势。
      </p>

      <h3 class="about-subtitle">核心能力</h3>
      <el-row :gutter="16">
        <el-col v-for="f in features" :key="f.title" :xs="24" :sm="12" :md="8">
          <div class="feature">
            <el-icon :size="22" color="#2563eb"><component :is="f.icon" /></el-icon>
            <div>
              <div class="feature__title">{{ f.title }}</div>
              <div class="feature__desc">{{ f.desc }}</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <h3 class="about-subtitle">技术栈</h3>
      <div class="tech-tags">
        <el-tag v-for="t in techStack" :key="t" class="tech-tag" effect="light">
          {{ t }}
        </el-tag>
      </div>

      <el-alert
        class="about-tip"
        type="info"
        :closable="false"
        show-icon
        title="数据来源"
        description="法规对比：34 个省级行政区的老年人权益保障法规原文（下载自国家法律法规数据库），由抽取脚本自动解析为可对比字段。数据看板：老年人、残疾人数据来自民政部、中国残联《2025 年度公报》；儿童数据来自《2024 年度统计监测报告》。"
      />

      <h3 class="about-subtitle">免责声明</h3>
      <ul class="disclaimer-list">
        <li>
          <b>项目性质：</b>本平台为技术学习 / 课程作业用途的静态可视化演示，
          非政府或任何官方机构发布，不代表任何官方立场。
        </li>
        <li>
          <b>数据来源：</b>法规对比数据抽取自国家法律法规数据库公开的 34 个省级行政区
          老年人权益保障法规原文；数据看板数据引自民政部、中国残疾人联合会
          《2025 年度公报》及《2024 年度统计监测报告》等公开统计资料。
        </li>
        <li>
          <b>准确性与完整性：</b>数据由脚本自动抽取，可能存在遗漏、滞后或偏差；
          所涉及的法规不全面，仅为初步整理，仍待核对，请以官方渠道公布的信息为准。
        </li>
        <li>
          <b>领土与主权：</b>香港、澳门是中华人民共和国的特别行政区，
          台湾是中国不可分割的一部分。本平台仅作技术可视化展示，所有内容不代表任何政治立场。
        </li>
        <li>
          <b>责任限制：</b>本平台按"现状"提供，作者不对因使用本平台信息而产生的任何后果承担责任；
          使用者应自行核实相关信息。
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const features = [
  { icon: 'Files', title: '法规对比', desc: '横向对比各省护理假、津贴年龄、免费公交/公园等维度' },
  { icon: 'MapLocation', title: '政策地图', desc: '34 省老年人权益保障法规核心指标按地理分布着色' },
  { icon: 'DataAnalysis', title: '数据看板', desc: '三大群体（老年人/残疾人/儿童）核心指标与趋势图表' },
  { icon: 'InfoFilled', title: '关于平台', desc: '项目背景、数据来源与免责声明说明' },
]

const techStack = [
  'Vue 3',
  'TypeScript',
  'Vite',
  'Vue Router',
  'Pinia',
  'Element Plus',
  'ECharts',
  'Tailwind CSS',
]
</script>

<style scoped>
.about-card {
  border-radius: 12px;
  border: 1px solid var(--border-color);
  max-width: 960px;
  margin: 0 auto;
}
.about-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px;
}
.about-desc {
  font-size: 14px;
  line-height: 1.9;
  color: #374151;
  margin: 0 0 24px;
}
.about-subtitle {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 16px;
  padding-left: 10px;
  border-left: 4px solid var(--brand);
}
.feature {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin-bottom: 16px;
}
.feature__title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}
.feature__desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tech-tag {
  border-radius: 12px;
  padding: 4px 12px;
}
.about-tip {
  margin-top: 28px;
  border-radius: 10px;
}
.disclaimer-list {
  margin: 4px 0 0;
  padding-left: 20px;
}
.disclaimer-list li {
  font-size: 13px;
  line-height: 1.8;
  color: #374151;
  margin-bottom: 10px;
}
.disclaimer-list b {
  color: #b45309;
}
</style>
