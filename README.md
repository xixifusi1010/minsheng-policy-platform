# 民生政策可视化平台

一个**纯前端静态网站**，用于多维度可视化展示民生领域政策数据。项目基于 Vue 3 + TypeScript + Vite 构建，使用 Element Plus 作为 UI 组件库、ECharts 进行数据可视化、Pinia 管理状态、Vue Router 组织路由，并用 Tailwind CSS 辅助样式。

## ⚠️ 免责声明

> 请务必先阅读以下声明，本项目仅用于技术学习 / 课程作业演示。

- **项目性质**：本平台为技术学习用途的静态可视化演示，非政府或任何官方机构发布，不代表任何官方立场。
- **数据来源**：法规对比数据抽取自国家法律法规数据库公开的 34 个省级行政区老年人权益保障法规原文；数据看板数据引自民政部、中国残疾人联合会《2025 年度公报》及《2024 年度统计监测报告》等**公开统计资料**。
- **准确性与完整性**：数据由脚本自动抽取，可能存在遗漏、滞后或偏差；**所涉及的法规不全面，仅为初步整理，仍待核对**，请以官方渠道公布的信息为准。
- **领土与主权**：香港、澳门是中华人民共和国的特别行政区，台湾是中国不可分割的一部分。本平台仅作技术可视化展示，所有内容不代表任何政治立场。
- **责任限制**：本平台按"现状"提供，作者不对因使用本平台信息而产生的任何后果承担责任；使用者应自行核实相关信息。

## ✨ 功能特性

- **法规对比**：横向对比 34 个省级行政区的独生子女护理假天数、高龄津贴起始年龄、免费公交/公园年龄、老年人定义年龄等维度，支持搜索、筛选、排序与多省对比栏。
- **政策地图**：基于 ECharts 中国地图（GeoJSON）按核心指标着色，点击省份就地弹出法规对比卡片。
- **数据看板**：老年人、残疾人、儿童三大群体的核心指标与趋势图表。
- **关于平台**：项目背景、数据来源与免责声明说明。

## 🛠 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 语言 | TypeScript |
| 构建 | Vite 5 |
| 路由 | Vue Router 4（history 模式） |
| 状态 | Pinia 2 |
| UI | Element Plus 2（中文语言包） |
| 图表 | ECharts 5 |
| 样式 | Tailwind CSS 3（关闭 preflight 以避免与 Element Plus 冲突） |

## 📁 项目结构

```
民生政策可视化平台/
├── index.html                # 入口 HTML
├── package.json              # 依赖与脚本
├── vite.config.ts            # Vite 配置（含 @ 别名）
├── netlify.toml             # Netlify 构建与 SPA 重定向配置
├── tsconfig.json            # 应用 TS 配置
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js        # PostCSS 配置
├── public/
│   ├── favicon.svg
│   └── china-geo.json       # 中国地图 GeoJSON（34 省级行政区）
├── assets/                  # 各地法规原文（docx/doc/pdf，供抽取脚本读取）
├── scripts/                 # 数据抽取与生成脚本（extract_elderly_law.py 等）
└── src/
    ├── main.ts              # 应用入口
    ├── App.vue              # 根组件
    ├── router/index.ts      # 路由表（history 模式）
    ├── stores/
    │   ├── app.ts           # 全局 UI 状态
    │   └── compare.ts       # 法规对比队列
    ├── types/index.ts       # 类型定义
    ├── data/
    │   ├── elderlyLawData.ts # 34 省法规对比数据（由脚本生成，勿手改）
    │   └── statData.ts       # 数据看板统计
    ├── styles/              # 全局与 Tailwind 样式
    ├── layout/AppLayout.vue  # 整体布局（头部 + 侧边菜单 + 内容区 + 页脚声明）
    ├── components/
    │   ├── StatCard.vue       # 指标卡片
    │   ├── ProvinceLawCard.vue# 省份法规卡片
    │   └── charts/
    │       ├── BaseChart.vue  # ECharts 通用封装
    │       ├── PolicyMap.vue  # 中国地图
    │       └── StatChart.vue  # 看板图表
    └── views/
        ├── ElderlyLawView.vue # 法规对比
        ├── PolicyMapView.vue  # 政策地图
        ├── DashboardView.vue  # 数据看板
        ├── AboutView.vue      # 关于平台
        └── NotFoundView.vue   # 404
```

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 类型检查
npm run type-check

# 构建生产静态文件到 dist/
npm run build

# 预览构建产物
npm run preview
```

## 📦 部署

`npm run build` 会在 `dist/` 下生成纯静态资源，可托管到任意静态服务器（Nginx、GitHub Pages、Netlify、Vercel 等）。

### History 路由的注意事项

本项目使用 `history` 模式路由，部署时需将所有未知路径重写（rewrite）到 `index.html`，否则刷新子页面会出现 404。

- **Nginx**：

  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```

- **Netlify**：仓库已内置 `netlify.toml`，已包含构建命令、`dist/` 发布目录，以及 `/* → /index.html` 的 SPA 重定向，连接仓库后直接部署即可。

### Netlify 一键部署

1. 将本仓库推送到 GitHub。
2. 在 Netlify 选择 "Import from Git" → 关联该仓库。
3. 构建命令 `npm run build`，发布目录 `dist`（配置文件中已写好）。
4. 部署完成后，所有子路由刷新均可正常访问。

## 📊 数据说明

- **法规对比数据**（`src/data/elderlyLawData.ts`）：由 `scripts/` 下的抽取脚本读取 `assets/` 中 34 个省级行政区的法规原文（docx / doc / pdf，含港澳台 OCR 识别）自动解析生成。**该文件由脚本生成，请勿手动修改**。
- **数据看板**（`src/data/statData.ts`）：引自民政部、中国残联等公开公报的统计数据。
- 所有数据仅供学习参考，不代表官方口径；涉及法规不全面、仍待核对。
