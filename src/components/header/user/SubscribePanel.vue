<template>
  <div class="max-h-55vh overflow-y-auto">
    <ul @click="onLinkToTheme">
      <li
        v-for="(item, index) in subscribes"
        :key="item.id"
        :data-index="index"
        class="inline-block w-full px-5 py-3 hover:bg-gray-100 transition-colors duration-250 cursor-pointer"
      >
        <h1 class="my-0 flex justify-between space-x-3">
          <span class="font-bold text-base text-green-500 truncate">{{
            item.title
          }}</span>
          <span
            class="rounded-md text-white px-1.5 whitespace-nowrap flex items-center"
            :class="[item.isSubscribe ? 'bg-gray-400 ' : 'bg-green-400']"
            @click.stop="persudoToggle(item)"
          >
            <Icon v-show="!item.isSubscribe" name="plus" />
            <span class="leading-5">{{
              item.isSubscribe ? "取消关注" : "关注"
            }}</span>
          </span>
        </h1>
        <div :class="{ 'space-x-1': item.latest }">
          <span class="font-bold text-gray-600">{{
            item.latest ? `${item.latest}个` : "暂无"
          }}</span>
          <span>最新回复</span>
        </div>
      </li>

      <li
        v-show="!subscribes.length"
        class="text-center text-gray-400 tracking-wider py-5"
      >
        你还没有关注哦 !
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "SubscribePanel",
  props: ["visible"],
  data() {
    return {
      subscribes: [],
    };
  },
  watch: {
    visible(status) {
      if (!status) {
        setTimeout(() => {
          this.subscribes = this.subscribes.filter((sub) => sub.isSubscribe);
        }, 300);
      }
    },
  },
  async mounted() {
    this.socket.on("addSubscribeLatest", this.onSubscribeComing);

    // 增加订阅后，在列表中新增
    this.$bus.$on("toggleSubscribe", this.onToggleSubscribe);

    this.$bus.$on("clearThemeLatest", this.clearThemeLatest);

    const subscribes = await this.$api.getSubscribes({
      skip: 0,
      limit: 5,
    });

    // prettier-ignore
    subscribes && subscribes.forEach((sub) => {
      sub.isSubscribe = true;
    });

    this.subscribes = this.subscribes.concat(subscribes ?? []);
  },
  methods: {
    onLinkToTheme({ target }) {
      let _tar = target;

      while (_tar.tagName !== "LI") {
        _tar = _tar.parentElement;
      }

      const { index } = _tar.dataset;
      const sub = this.subscribes[+index];
      const { themeId } = this.$route.params;

      if (themeId === sub?.themeId) return false;

      this.$router.push({
        name: "theme",
        params: { themeId: sub?.themeId },
        query: { rId: sub?.replyId },
      });
    },
    onToggleSubscribe({ type, detail }) {
      if (type === 1) {
        // 增加
        const subscribe = this.generateSubscribe(detail);
        this.subscribes.unshift(subscribe);
      } else {
        const { _id } = detail;
        // 去除
        const targetIndex = this.subscribes.findIndex(
          ({ themeId }) => themeId === _id
        );

        this.subscribes.splice(targetIndex, 1);
      }
    },
    generateSubscribe(detail) {
      const { _id, title } = detail;

      const subscribe = {
        replyId: "",
        lastest: 0,
        themeId: _id,
        title,
        isSubscribe: true,
      };

      return subscribe;
    },
    onSubscribeComing(themeId) {
      const target = this.subscribes.find(({ id }) => themeId === id);
      target.latest += 1;
    },
    clearThemeLatest(themeId) {
      const target = this.subscribes.find(({ id }) => themeId === id);
      // 可能该订阅已经被移除
      target && (target.latest = 0);
    },
    /**
     * @param { Event } e
     */
    async persudoToggle(subscribe) {
      // 取消 0， 关注 1
      const type = +!subscribe.isSubscribe;
      const result = await this.$api.toggleSubscribe(subscribe.themeId, type);

      if (result === "success") {
        const message = type ? "已关注" : "已取消关注";
        this.$message.success(message);

        subscribe.isSubscribe = !subscribe.isSubscribe;

        // 更改主题详情页的按钮状态
        this.$bus.$emit("toggleSubButton", subscribe.themeId);
      } else {
        this.$message.error("操作失败");
      }
    },
  },
};
</script>
