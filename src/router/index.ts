import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * 路由说明
 * - 保留 4 个功能，侧边栏顺序：法规对比 → 政策地图 → 数据看板 → 关于平台
 * - 其它基于模拟数据的功能（数据总览/政策分类/趋势分析/政策详情）已移除
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/elderly-law',
  },
  {
    path: '/elderly-law',
    name: 'elderly-law',
    component: () => import('@/views/ElderlyLawView.vue'),
    meta: { title: '法规对比', icon: 'Files' },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/PolicyMapView.vue'),
    meta: { title: '政策地图', icon: 'MapLocation' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: '数据看板', icon: 'DataAnalysis' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于平台', icon: 'InfoFilled' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 动态设置页面标题
router.afterEach((to) => {
  const base = '民生政策可视化平台'
  document.title = to.meta?.title ? `${to.meta.title} - ${base}` : base
})

export default router
