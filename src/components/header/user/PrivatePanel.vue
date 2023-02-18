<template>
  <div class="max-h-55vh overflow-y-auto" @scroll.self.stop="onLoadPrivate">
    <p
      v-if="isEmptyPrivate"
      class="text-center text-gray-400 tracking-wider py-5"
    >
      暂时没有新消息哦 !
    </p>

    <!-- 最新私信信息 -->
    <!-- <PrivateList
            v-if="updatedLen > 0"
            :list="updatedPrivateList"
            @closePanel="visible = false"
          /> -->
    <ul class="space-y-2">
      <li
        v-for="item in updatedPrivateList"
        :key="item.id"
        class="flex py-3 px-5 cursor-pointer hover:bg-gray-100 space-x-3 transition-colors duration-300"
      >
        <router-link :to="`/u/${item.from_user.username}`">
          <img :src="item.from_user.avatar" class="rounded-1/2 w-8.5 h-8.5" />
        </router-link>
        <router-link :to="`/message/${item.id}`">
          <div class="flex flex-col space-y-2">
            <span class="text-gray-600 font-light text-base leading-4">{{
              item.from_user.username
            }}</span>
            <span
              class="text-gray-700 font-semibold tracking-wider"
              :title="item.title"
              >标题: {{ item.title }}</span
            >
            <span
              class="text-gray-400"
              v-date.live.CN.suffix="item.createDate"
            ></span>
          </div>
        </router-link>
      </li>
    </ul>

    <!-- 历史私信信息 -->
    <ul class="space-y-2">
      <li
        v-for="item in historyPrivateList"
        :key="item.id"
        class="flex py-3 px-5 cursor-pointer hover:(bg-gray-100) space-x-3 transition-colors duration-300"
      >
        <router-link :to="`/u/${item.from_user.username}`">
          <img :src="item.from_user.avatar" class="rounded-1/2 w-8.5 h-8.5" />
        </router-link>
        <router-link :to="`/private-msg/receive?id=${item.id}`">
          <div class="flex flex-col space-y-2">
            <span class="text-gray-600 font-light text-base leading-4">{{
              item.from_user.username
            }}</span>
            <span
              class="text-gray-700 font-semibold tracking-wider"
              :title="item.title"
            >
              标题: {{ item.title }}
            </span>
            <span
              class="text-gray-400"
              v-date.live.CN.suffix="item.createDate"
            ></span>
          </div>
        </router-link>
      </li>
    </ul>

    <DataLoading :show="isFetching" />

    <!-- 查看更多提示 -->
    <router-link
      v-if="isPrivateHitLimit"
      :to="{
        name: 'messageList',
        params: { type: 'receive', username },
      }"
      class="table w-full px-3 pb-3 hover:(text-gray-600)"
    >
      <!-- prettier-ignore -->
      <div
        class="mt-2 py-2 text-center cursor-pointer table-cell rounded-md
            bg-gray-200  hover:(bg-gray-300 ) transition-colors duration-300 mb-3"
      >
        查看更多
      </div>
    </router-link>

    <a-divider v-show="noMorePrivate" class="!px-8">
      <span class="text-xs text-gray-400">没有更多了</span>
    </a-divider>
  </div>
</template>

<script>
export default {
  name: "PrivatePanel",
  props: {
    username: String,
  },
  data() {
    return {
      page: 0,
      limit: 10,
      isFetching: false,
      hasSetGrandWidth: false,
      // 最新私信是否已经查看，查看之后放置于历史私信中
      isPrivateScanned: false,
      // 列表最大渲染数量
      tabListLenLimit: 12,
      noMorePrivate: false,
      // 历史私信
      historyPrivateList: [],
      // 最新私信
      updatedPrivateList: [],
      // 轮询私信 interval
      pollUserPrivateTimer: null,
    };
  },
  computed: {
    isPrivateHitLimit() {
      return this.updatedLen + this.historyLen >= this.tabListLenLimit;
    },
    isEmptyPrivate() {
      return !this.updatedLen && !this.historyLen;
    },
    historyLen() {
      return this.historyPrivateList.length;
    },
    updatedLen() {
      return this.updatedPrivateList.length;
    },
  },
  watch: {
    updatedLen(len) {
      this.$emit("setUpdatedLen", len);
    },
  },
  created() {
    this.getUserPrivate();

    this.socket.on("update_private", this.updatePrivate);
  },
  methods: {
    /**
     * 获取用户最新私信
     * @param { 0 | 1 } type 判断返回的数据是接收还是发送
     * 1：发送
     * 0：接收
     */
    async getUserPrivate() {
      const latest_private = await this.$api.getPrivateList({
        // 如果在获取的同时出现了新的私信，则对于数据库来说，应该跳过的数目应该增加最新的数量
        // 否则出现重复的项
        skip: this.page * this.limit + this.updatedLen,
        limit: this.limit,
        type: 0,
      });

      if (
        (!latest_private || !latest_private.length) &&
        this.historyLen + this.updatedLen > 0
      ) {
        this.noMorePrivate = true;
        return;
      }

      this.historyPrivateList = this.historyPrivateList.concat(
        ...latest_private
      );

      this.page++;
    },
    /**
     * @param { Event }
     */
    async onLoadPrivate({ target }) {
      if (!this.noMorePrivate) {
        const { scrollHeight, scrollTop, clientHeight } = target;

        /**
         * 触底、没有在获取（防止重复触发）、没有到达限制
         */
        if (
          clientHeight + scrollTop === scrollHeight &&
          !this.isFetching &&
          !this.isPrivateHitLimit
        ) {
          this.isFetching = true;

          await this.getUserPrivate();

          this.isFetching = false;
        }
      }
    },

    updatePrivate(_private) {
      !this.isPrivateHitLimit && this.updatedPrivateList.unshift(_private);

      // 如果此时正在请求新的私信列表，取消当前请求，重新请求
      if (this.isFetching) {
        this.$store.commit("FLUSH_CANCELQUENE");

        this.getUserPrivate();
      }
    },
    onScannedUpdatedPrivate() {
      // prettier-ignore
      this.$nextTick(() => {
        const updateCopy = this.updatedPrivateList;
        this.updatedPrivateList = [];
        this.historyPrivateList = updateCopy.concat(...this.historyPrivateList);
      });
    },
  },
};
</script>
