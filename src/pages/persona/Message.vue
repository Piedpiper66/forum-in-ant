<template>
  <div class="flex">
    <!-- 文字导航栏 -->
    <nav class="space-y-5 min-w-[10rem]">
      <router-link
        v-for="nav in navList"
        :key="nav.label"
        :to="{ name: 'messageList', params: { type: nav.type } }"
        class="nav text-gray-300"
        :class="[
          currentType === nav.type ? 'nav-text-focus' : 'nav-text-hover',
        ]"
        style="display: block"
      >
        <Icon v-if="nav.iconName" :name="nav.iconName" class="mr-1" />
        <span :data-type="nav.type">{{ nav.title }}</span>
      </router-link>
    </nav>

    <transition name="slide-fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Message",
  data() {
    return {
      isLoaded: true,
      navList: [
        { title: "发送", type: "send" },
        { title: "接收", type: "receive" },
      ],
      currentType: "send",
    };
  },
  watch: {
    "$route.params": {
      handler({ type }) {
        if (this.$route.name === "messageList") {
          this.currentType = type;

          this.$emit("resetBtnRoute", { root: "message", type });
        }
      },
      immediate: true,
    },
  },
  methods: {},
};
</script>
