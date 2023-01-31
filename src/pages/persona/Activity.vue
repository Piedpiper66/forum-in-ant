<template>
  <page-loading :loading="!isLoaded">
    <div id="activity" v-if="isLoaded" key="activity" class="flex space-x-10">
      <!-- 文字导航栏 -->
      <nav class="space-y-5 min-w-[8rem]">
        <router-link
          v-for="nav in navList"
          :key="nav.label"
          :to="{ name: 'activityList', params: { type: nav.value } }"
          class="nav text-gray-300"
          :class="[
            currentType === nav.value ? 'nav-text-focus' : 'nav-text-hover',
          ]"
          style="display: block"
        >
          <Icon v-if="nav.iconName" :name="nav.iconName" class="mr-1" />
          <span :data-type="nav.value">{{ nav.label }}</span>
        </router-link>
      </nav>

      <!-- 对应导航的内容 -->
      <keep-alive>
        <router-view :moduleName="moduleName" class="flex-1"></router-view>
      </keep-alive>
    </div>
  </page-loading>
</template>

<script>
import { mapGetters } from "vuex";
import ActivityList from "../../components/persona/ActivityList.vue";

export default {
  name: "Activity",
  components: {
    ActivityList,
  },
  data() {
    return {
      isLoaded: true,
      navList: [
        { label: "全部", value: "all" },
        { label: "主题", value: "theme" },
        { label: "回复", value: "reply" },
        { label: "草稿", value: "draft" },
        { label: "点赞", value: "support" },
        { label: "收藏", value: "bookmark" },
        { label: "已解决", value: "resolve", iconName: "resolve" },
      ],
      currentType: "all",
    };
  },
  computed: {
    ...mapGetters(["isLogin", "userId"]),
    moduleName() {
      const target = this.navList.find(
        (item) => item.value === this.currentType
      );
      return target?.label;
    },
  },
  watch: {
    "$route.params": {
      handler({ type }) {
        if (this.$route.name === "activityList") {
          this.currentType = type;

          this.$emit("resetBtnRoute", { root: "activity", type });
        }
      },
      immediate: true,
    },
  },
  created() {
    // 如果没登陆且 summary 对应的用户不是用户自身
    if (this.$attrs.filterRoute) {
      this.navList = this.navList.filter(
        ({ value }) => !["draft", "bookmark"].includes(value)
      );
    }
  },
  methods: {},
};
</script>

<style lang="postcss" scoped></style>
