<template>
  <el-container style="height: 100vh; padding: 20px;">
    <!-- 顶部部分 -->
    <el-header style="display: flex; align-items: stretch; gap: 20px; height: 250px;">
      <!-- 左侧轮播图 -->
      <el-carousel autoplay height="100%" class="carousel-container">
        <el-carousel-item v-for="(color, index) in colors" :key="index">
          <div class="carousel-item" :style="{ backgroundColor: color }"></div>
        </el-carousel-item>
      </el-carousel>

      <!-- 右侧信息展示区 -->
      <el-card class="info-card" :style="{ height: '100%' }">
        <div class="info-content">
          <h3>------</h3>
          <p>套餐剩余：<strong>----条</strong></p>
          <p>会话端口：<strong>---</strong> <el-icon><i class="el-icon-chat-dot-square"></i></el-icon></p>
          <el-button type="success" size="small">续费套餐</el-button>
        </div>
      </el-card>
    </el-header>

    <!-- 内容主体部分 -->
    <el-main style="overflow: auto;">
      <el-card>
        <div class="title">数据统计</div>
        <LineChart />
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import LineChart from '../components/LineChart.vue'

// 模拟轮播图色块数据
const colors = ref(['#4caf50', '#2196f3', '#ff9800'])
</script>

<style scoped>
.carousel-container {
  width: 70%;
}

.carousel-item {
  width: 100%;
  height: 100%;
}

.info-card {
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.info-content {
  text-align: center;
}

.title {
  font-size: 20px;
  margin-bottom: 10px;
}
</style>
