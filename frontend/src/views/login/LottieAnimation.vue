<template>
  <lottie-animation :options="defaultOptions" />
</template>

<script>
import { defineComponent } from "vue";
import LottieAnimation from "vue3-lottie";

export default defineComponent({
  components: {
    LottieAnimation,
  },
  props: {
    animationData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      defaultOptions: {
        animationData: this.animationData,
        loop: true,
        autoplay: true,
      },
    };
  },
});
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>
