<template>
  <el-container class="app-layout">
    <!-- 顶部栏 -->
    <el-header class="app-header" height="60px">
      <div class="app-header__left">
        <el-icon class="app-header__logo"><DataAnalysis /></el-icon>
        <span class="app-header__title">民生政策可视化平台</span>
      </div>

      <div class="app-header__right">
        <span class="app-header__date">数据更新 · 2026</span>
        <el-tooltip content="折叠 / 展开菜单" placement="bottom">
          <el-button text circle @click="app.toggleSidebar()">
            <el-icon><Fold v-if="!app.sidebarCollapsed" /><Expand v-else /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </el-header>

    <el-container class="app-body">
      <!-- 侧边栏：仅功能导航 -->
      <el-aside
        class="app-aside"
        :width="app.sidebarCollapsed ? '64px' : '220px'"
      >
        <el-menu
          :default-active="activeMenu"
          :collapse="app.sidebarCollapsed"
          :collapse-transition="false"
          router
          class="app-menu"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 全局免责声明页脚 -->
    <footer class="app-footer">
      <span>
        本站为技术学习 / 课程作业项目，内容基于公开资料初步整理，<b>仅供学习参考，不构成任何官方发布、法律意见或政策依据</b>；
        所收录法规不全面，仍以官方发布为准。香港、澳门是中华人民共和国的特别行政区，台湾是中国不可分割的一部分。
      </span>
    </footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const app = useAppStore()

// 从路由表提取可见菜单项（功能导航）
const menuItems = computed(() =>
  (router.options.routes as RouteRecordRaw[])
    .filter((r) => !r.meta?.hidden && r.meta?.title && r.meta?.icon)
    .map((r) => ({
      path: r.path,
      title: r.meta!.title as string,
      icon: r.meta!.icon as string,
    })),
)

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  z-index: 10;
}
.app-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.app-header__logo {
  font-size: 26px;
  color: var(--brand);
}
.app-header__title {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}
.app-header__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.app-header__date {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}
.app-body {
  flex: 1;
  overflow: hidden;
}
.app-aside {
  background: #ffffff;
  border-right: 1px solid var(--border-color);
  transition: width 0.2s ease;
  overflow-y: auto;
}
.app-menu {
  border-right: none;
  padding-top: 6px;
}
.app-main {
  background: var(--bg-page);
  overflow-y: auto;
  padding: 0;
}
.app-footer {
  flex-shrink: 0;
  padding: 10px 20px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
  background: #ffffff;
  border-top: 1px solid var(--border-color);
}
.app-footer b {
  color: #b45309;
}
</style>
