<template>
  <div class="w-full mb-5">
    <ul class="pr-4 space-y-4">
      <li
        v-for="item in privateList"
        :key="item.id"
        class="space-y-3 hover:bg-gray-100 px-3 py-2 rounded-md cursor-pointer transition-colors duration-300"
      >
        <!-- 用户信息 -->
        <div class="flex justify-between">
          <div class="flex space-x-3">
            <Avatar
              :userId="item.from"
              :username="item.from_user.username"
              :src="item.from_user.avatar"
              :size="50"
            />
            <div>
              <div class="text-xl font-semibold text-gray-500 font-mono">
                {{ item.from_user.username }}
              </div>
              <div class="text-base font-thin text-gray-400 font-mono">
                {{ item.from_user.fullname }}
              </div>
            </div>
          </div>
          <div>
            <span
              class="text-sm text-gray-400"
              v-date.CN.live.suffix="item.createDate"
            ></span>
          </div>
        </div>
        <!-- 标题 -->
        <div class="space-x-3 pl-3">
          <span class="font-semibold text-gray-400 text-lg">标题: </span>
          <span class="font-bold text-base text-gray-600">{{
            item.title
          }}</span>
        </div>
        <!-- 内容 -->
        <div class="space-x-3 pl-3">
          <span class="font-semibold text-gray-400 text-lg">内容: </span>
          <span class="font-bold text-base text-gray-600">{{
            item.content | truncateContent
          }}</span>
        </div>
      </li>
    </ul>
    <a-divider class="!px-20" v-if="noMorePrivate">
      <span class="text-xs text-gray-400">我是有底线的~</span>
    </a-divider>
    <DataLoading :show="isFetching" />
  </div>
</template>

<script>
const html = document.documentElement;

export default {
  name: "MessageList",
  beforeRouteUpdate(to, from, next) {
    this.page = 0;
    this.isFetching = false;
    this.noMorePrivate = false;
    this.privateList = [];

    this.$emit("toggle");

    next();
  },
  data() {
    return {
      text: "",
      page: 0,
      limit: 10,
      isFetching: false,
      updatedLen: 0,
      noMorePrivate: false,
      privateList: [],
      currType: 1,
    };
  },
  watch: {
    "$route.params": {
      handler({ type }) {
        this.privateList = [];
        const currType = type === "receive" ? 0 : 1;
        this.currType = currType;

        this.getUserPrivate(currType);
      },
      immediate: true,
    },
  },
  filters: {
    truncateContent: (content) => {
      return content.length > 30 ? content.slice(0, 30) + "..." : content;
    },
  },
  mounted() {
    document.onscroll = this.copeScrollFetch;
  },
  beforeDestroy() {
    document.onscroll = null;
  },
  methods: {
    async getUserPrivate(type) {
      this.isFetching = true;

      const latest_private = await this.$api.getPrivateList({
        // 如果在获取的同时出现了新的私信，则对于数据库来说，应该跳过的数目应该增加最新的数量
        // 否则出现重复的项
        skip: this.page * this.limit + this.updatedLen,
        limit: this.limit,
        type,
      });

      if (!latest_private || !latest_private.length) {
        this.isFetching = false;

        setTimeout(() => {
          this.noMorePrivate = true;
        }, 100);
        return;
      }

      this.isFetching = false;
      setTimeout(() => {
        this.privateList = this.privateList.concat(...latest_private);
      }, 300);

      this.page++;
    },
    /**
     * @param { Event }
     */
    async copeScrollFetch() {
      if (!this.noMorePrivate && !this.isFetching) {
        const { scrollHeight, scrollTop, clientHeight } = html;

        if (clientHeight + scrollTop === scrollHeight) {
          await this.getUserPrivate(this.currType);
        }
      }
    },
  },
};
</script>
