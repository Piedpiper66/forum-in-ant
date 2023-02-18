<template>
  <a-spin
    :spinning="loading"
    size="large"
    :tip="loadingTip"
    class="select-none"
    ref="loading"
  >
    <Icon slot="indicator" name="smile" size="2.25rem" spin />

    <transition-group name="slide-fade" mode="out-in" tag="div">
      <slot></slot>
      <div
        v-if="loading"
        key="loading"
        :style="{ height: loadingHeight }"
      ></div>
    </transition-group>
    <!-- class="h-leave-header" -->
  </a-spin>
</template>

<script>
export default {
  name: "PageLoading",
  props: ["loading", "title"],
  data() {
    return {
      loadingHeight: 0,
      dots: " .",
      timer: null,
    };
  },
  computed: {
    originTip() {
      return this.title || "Vue Forum Loading ";
    },
    loadingTip() {
      return this.originTip + this.dots;
    },
  },
  watch: {
    loading() {
      clearInterval(this.timer);
    },
  },
  mounted() {
    // const top = this.$refs.loading.getBoundingClientRect().y;
    const top = this.$refs.loading.$el.offsetTop;

    this.loadingHeight = window.innerHeight - top - 50 + "px";

    let i = 1;
    let dot = " .";

    this.timer = setInterval(() => {
      if (i === 4) i = 1;
      this.dots = dot.repeat(i);
      i++;
    }, 400);
  },
  destroyed() {
    clearInterval(this.timer);
  },
};
</script>
