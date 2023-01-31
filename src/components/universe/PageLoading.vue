<template>
  <a-spin
    :spinning="$attrs.loading"
    size="large"
    tip="Vue Forum Loading ..."
    class="select-none"
    ref="loading"
  >
    <Icon slot="indicator" name="smile" size="2.25rem" spin />

    <transition-group name="slide-fade" mode="out-in" tag="div">
      <slot></slot>
      <div
        v-if="$attrs.loading"
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
  data() {
    return {
      loadingHeight: 0,
    };
  },
  mounted() {
    this.loadingHeight =
      innerHeight - this.$refs.loading.$el.offsetTop - 20 + "px";
  },
};
</script>
