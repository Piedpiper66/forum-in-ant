<template>
  <div class="flex">
    <!-- 文字导航栏 -->
    <nav
      class="space-y-5 min-w-[10rem] transi-300 sm:-translate-x-1/1 md:(inline-block -translate-x-1/1)"
    >
      <router-link
        v-for="nav in navList"
        :key="nav.label"
        :to="{ name: nav.type }"
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
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Preference",
  data() {
    return {
      isLoaded: false,
      navList: [
        { title: "账户", type: "account" },
        { title: "个人信息", type: "profile" },
      ],
      currentType: "account",
    };
  },
  watch: {
    $route: {
      handler({ name }) {
        // 这里会因为 persona 中的横向按钮重新设置为 account, 其他部分都是
        if (["account", "profile"].includes(name)) {
          this.currentType = name;

          this.$emit("resetBtnRoute", { root: "preference", type: name });
        }
      },
      immediate: true,
    },
  },
};
</script>
