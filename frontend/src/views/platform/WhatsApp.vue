<template>
  <div class="container">
    <div class="left-div">
      <AsideCard title="WhatsApp"></AsideCard>
    </div>
    <div class="right-div">
      <el-empty description="没有打开任何会话" />
    </div>
  </div>
</template>
<script setup>
import AsideCard from "@/views/platform/AsideCard.vue";
import { ipc } from '@/utils/ipcRenderer';
// # 定义通信频道，即路由
const ipcApiRoute = {
  addSession: 'controller.window.addSession',
}
const receiveCardId = (card)=> {
  const args = {cardId:card.cardId,title:card.title,online:card.online,platform:'WhatsApp',activeStatus:true}
  //初始化机器码
  ipc.invoke(ipcApiRoute.addSession, args).then(res => {
    // console.log('收到数据：',res)
  })
}

</script>
<style scoped>
.container {
  display: flex; /* 使用 flex 布局 */
  height: 100vh; /* 高度占满视口 */
}

.left-div {

}

.right-div {
  height: 100vh;
  flex-grow: 1; /* 占据剩余空间 */
  border-left: 1px solid #e0e0e0;
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直方向居中 */
  justify-content: center; /* 水平方向居中 */
}
</style>
