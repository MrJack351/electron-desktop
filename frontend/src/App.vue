<template>
  <router-view/>
</template>

<script>
export default {
name: 'App',
setup() {
  document.getElementById('loadingPage').remove()
}
}
</script>
<style lang="less">
body {
  margin: 0;
}
</style>
