<template>
  <ul class="text-base">
    <li
      v-for="(item, index) in settingList"
      :key="index"
      class="hover:bg-gray-100 cursor-pointer transition-colors duration-400"
      @click="$emit('close')"
    >
      <router-link
        :to="item.route"
        class="tracking-wider w-full h-full inline-block px-5 py-2"
      >
        <Icon :name="item.icon" size="1.05rem" className="mr-3" />
        {{ item.title }}
      </router-link>
    </li>
    <li
      class="hover:bg-gray-100 cursor-pointer px-5 py-2 transition-colors duration-400"
      @click="logout"
    >
      <span class="cursor-pointer tracking-wider">
        <Icon name="logout" size="1rem" class="mr-3 pl-0.5" />
        退出登录
      </span>
    </li>
  </ul>
</template>

<script>
export default {
  name: "SettingPanel",
  props: {
    username: String,
  },
  data() {
    return {
      settingList: [
        {
          title: "概要",
          icon: "overview",
          route: { name: "summary", params: { username: "" } },
        },
        {
          title: "活动",
          icon: "history",
          route: { name: "activity", params: { username: "" } },
        },
        {
          title: "草稿",
          icon: "draft",
          route: {
            name: "activityList",
            params: { username: "", type: "draft" },
          },
        },
        {
          title: "设置",
          icon: "setting",
          route: { name: "account", params: { username: "" } },
        },
      ],
    };
  },
  created() {
    this.settingList.forEach(({ route }) => {
      route.params.username = this.username;
    });
  },
  methods: {
    async logout() {
      this.$store.dispatch("setEditorStatus", false);

      await this.$store.dispatch("logout");

      location.reload();
    },
  },
};
</script>
