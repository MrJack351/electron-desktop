<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px" style="background-color: antiquewhite;height: 100%">
        <el-button type="primary" @click="test">测试Renderer</el-button>
        <el-button type="primary" @click="createWindow">打开新窗口</el-button>
      </el-aside>
      <el-main style="background-color: aliceblue">
        <el-empty description="No Data" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {ipc} from "@/utils/ipcRenderer";
// # 定义通信频道，即路由
const ipcApiRoute = {
  test: 'controller.example.test',
  addWindow: 'controller.example.addWindow',
}
const test = ()=>{
  ipc.invoke(ipcApiRoute.test, {name:'张三'}).then(r => {
    // r为返回的数据
    console.log(r);
  })
}

const createWindow = () => {
  ipc.invoke(ipcApiRoute.addWindow, {
    type: 'vue', // 类型可以为 'html'、'web'、或 'vue'
    content: '/path/to/page', // Vue 路由路径
    windowName: 'newWindow', // 窗口名称
    windowTitle: '新窗口', // 窗口标题
  }).then(response => {
    console.log(response); // 打印返回值，如窗口的内容 ID
  });
}


</script>
<style scoped>

</style>
