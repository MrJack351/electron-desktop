<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 获取过去七天的日期
const getLast7Days = () => {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}-${date.getDate()}`)
  }
  return dates
}

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  // 初始化图表
  chartInstance = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['翻译次数', '消耗字符数']
    },
    xAxis: {
      type: 'category',
      data: getLast7Days()
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '翻译次数',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '消耗字符数',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310]
      }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', chartInstance.resize)
})

onUnmounted(() => {
  if (chartInstance) {
    window.removeEventListener('resize', chartInstance.resize)
    chartInstance.dispose()
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 400px; /* 设置最小高度，保证自适应 */
}
</style>
