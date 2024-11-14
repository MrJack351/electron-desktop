<template>
  <el-container style="height: 100vh;">
    <!-- 左侧导航栏 -->
    <el-aside width="50px" class="aside-menu">
      <div class="nav-container">
        <div
            v-for="item in menuItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeMenu === item.id }"
            @click="handleMenuSelect(item.id)"
        >
          <el-icon><img :src="item.icon" class="platform-svg" draggable="false"></el-icon>
        </div>
      </div>

      <!-- 退出按钮 -->
      <div class="logout-button" @click="handleLogout">
        <el-icon><img src="@/assets/svgs/quit.svg" class="platform-svg" draggable="false"></el-icon>
      </div>
    </el-aside>

    <!-- 主体内容 -->
    <el-container>
      <el-main style="padding: 0; overflow: hidden">
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, markRaw } from 'vue';
import { useRouter } from 'vue-router';
// 导入页面组件
import HomePage from "@/views/platform/HomePage.vue";
import WhatsApp from "@/views/platform/WhatsApp.vue";
import Telegram from "@/views/platform/Telegram.vue";
import TelegramK from "@/views/platform/TelegramK.vue";

// 导入图标文件
import homeIcon from '@/assets/svgs/index.svg';
import whatsappIcon from '@/assets/svgs/whatsapp.svg';
import telegramIcon from '@/assets/svgs/telegram.svg';
import telegramKIcon from '@/assets/svgs/telegramK.svg';
import quitIcon from '@/assets/svgs/quit.svg';
import { ipc } from '@/utils/ipcRenderer';
// 定义通信频道，即路由
const ipcApiRoute = {
  hideWindow: 'controller.window.hideWindow',
  logout: 'controller.window.logout',
};
// 组件映射表
const menuItems = [
  { id: 'home', icon: homeIcon, component: markRaw(HomePage) },
  { id: 'whatsApp', icon: whatsappIcon, component: markRaw(WhatsApp) },
  { id: 'telegram', icon: telegramIcon, component: markRaw(Telegram) },
  { id: 'telegramK', icon: telegramKIcon, component: markRaw(TelegramK) },
];

const activeMenu = ref('home');
const currentComponent = ref(menuItems[0].component);
const router = useRouter();

// 处理菜单点击
function handleMenuSelect(index) {
  // 如果点击的菜单项已经是当前活动菜单项，直接返回，避免重复操作
  if (activeMenu.value === index) return;
  // 隐藏所有窗体
  ipc.invoke(ipcApiRoute.hideWindow, { platform: index });
  // 更新当前活动菜单和组件
  activeMenu.value = index;
  currentComponent.value = menuItems.find(item => item.id === index).component;
}

// 处理退出按钮点击
function handleLogout() {
  ipc.invoke(ipcApiRoute.logout,{}).then(()=>{
    router.push('/login');
  })
}
</script>

<style scoped>
.aside-menu {
  position: relative; /* 为了定位底部按钮 */
  border-right: 1px solid #e0e0e0; /* 添加右侧边框 */
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden; /* 不影响底部按钮 */
}
.nav-container {
  width: 100%;
  overflow-y: auto; /* 当菜单项过多时启用滚动 */
  flex-grow: 1;
}

.nav-item {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.nav-item:hover {
  background-color: #f0f0f0; /* 悬停背景 */
}

.nav-item.active {
  background-color: #cccccc; /* 激活状态背景 */
  color: white; /* 激活状态图标颜色 */
}

.logout-button {
  position: absolute; /* 固定在容器底部 */
  bottom: 1px; /* 离底部的距离 */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  cursor: pointer;
  color: #000000; /* 退出按钮颜色 */
  transition: background-color 0.3s, color 0.3s;
  border-top: 1px solid #e0e0e0; /* 添加右侧边框 */
}

.logout-button:hover {
  background-color: #dddddd; /* 悬停背景 */
}

.platform-svg {
  height: 30px;
  width: 30px;
}

/* 自定义滚动条样式 */
.nav-container::-webkit-scrollbar {
  width: 0; /* 滚动条的宽度 */
}

.nav-container::-webkit-scrollbar-thumb {
  background-color: #bbbbbb; /* 滚动条滑块的颜色 */
  border-radius: 0; /* 滑块的圆角 */
}
</style>
