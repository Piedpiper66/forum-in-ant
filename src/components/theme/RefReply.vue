<template>
  <div
    class="inner-reply relative mb-2 border-1 border-solid pl-6 pr-3 py-2 rounded-sm flex"
  >
    <span class="collapse-btn z-10" title="折叠" @click="toggleVisible">
      <Icon name="no-stick-arrow" class="text-gray-400" />
    </span>
    <img :src="refDetail.avatar" class="w-8.5 h-8.5 rounded-full" />
    <div class="detail w-full ml-3">
      <div class="userInfo flex justify-between">
        <span class="text-gray-400 font-semibold">{{
          refDetail.username
        }}</span>
        <span
          title="转到更早的回复"
          class="text-gray-400 cursor-pointer transi-300 hover:(scale-115 text-gray-600)"
          @click="moveToTarget"
        >
          <Icon name="arrow-up" />
        </span>
      </div>
      <div
        class="md-content py-2 mt-2"
        v-html="refDetail.markdown || refDetail.content"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InnerReply",
  props: {
    refDetail: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    toggleVisible() {
      this.$emit("toggle");
    },
    moveToTarget() {
      this.$bus.$emit("moveToRef", this.refDetail._id);
    },
  },
};
</script>

<style lang="postcss">
.collapse-btn {
  @apply absolute -left-4 top-2 w-8 h-8 flex items-center justify-center rounded-1/2 cursor-pointer
  border-1 bg-white transition-colors duration-200 hover:bg-gray-300;
}
</style>
