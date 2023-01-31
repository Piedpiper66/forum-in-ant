<template>
  <a-popover
    v-model="visible"
    trigger="click"
    placement="bottomRight"
    :overlayStyle="{ zIndex: 1101 }"
    class="userpanel"
    :getPopupContainer="getRenderNode"
    @visibleChange="onPanelShow"
  >
    <a-avatar
      :src="userInfo.avatar"
      :size="35"
      class="cursor-pointer shadow-md"
    />
    <a-tabs
      slot="content"
      default-active-key="1"
      :tabBarStyle="{ userSelect: 'none' }"
      :animated="false"
      class="user-panel"
    >
      <!-- 私信列表 -->
      <a-tab-pane key="1">
        <span slot="tab" class="py-3 space-x-2 tracking-wider">私信</span>
        <div class="max-h-70vh">
          <!-- 最新私信信息 -->
          <ul v-if="updatedPrivateList.length > 0" class="space-y-2">
            <li
              v-for="item in updatedPrivateList"
              :key="item.id"
              class="flex py-3 px-5 cursor-pointer hover:(bg-gray-100) space-x-3 transition-colors duration-300"
            >
              <router-link :to="`/u/${getFromUser(item, 'username')}`">
                <el-avatar
                  :src="getFromUser(item, 'avatar')"
                  size="medium"
                ></el-avatar>
              </router-link>
              <router-link :to="`/message/${item.id}`">
                <div class="flex flex-col space-y-2" @click="visible = false">
                  <span class="text-gray-600 font-light text-base leading-4">{{
                    getFromUser(item, "username")
                  }}</span>
                  <span
                    class="text-gray-700 font-semibold tracking-wider"
                    :title="item.title"
                    >{{ item.title }}</span
                  >
                  <span class="text-gray-400">{{
                    item.createDate | formatTime
                  }}</span>
                </div>
              </router-link>
            </li>
          </ul>

          <p class="text-center text-gray-400 tracking-wider py-5">
            暂时没有最新消息哦 !
          </p>

          <!-- 历史私信信息 -->
          <ul v-if="historyPrivateList.length > 0" class="space-y-2">
            <li
              v-for="item in historyPrivateList"
              :key="item.id"
              class="flex py-3 px-5 cursor-pointer hover:(bg-gray-100) space-x-3 transition-colors duration-300"
            >
              <router-link :to="`/u/${getFromUser(item, 'username')}`">
                <el-avatar
                  :src="getFromUser(item, 'avatar')"
                  size="medium"
                ></el-avatar>
              </router-link>
              <router-link :to="`/message/${item.id}`">
                <div class="flex flex-col space-y-2" @click="visible = false">
                  <span class="text-gray-600 font-light text-base leading-4">{{
                    getFromUser(item, "username")
                  }}</span>
                  <span
                    class="text-gray-700 font-semibold tracking-wider"
                    :title="item.title"
                    >{{ item.title }}</span
                  >
                  <span class="text-gray-400">{{
                    item.createDate | formatTime
                  }}</span>
                </div>
              </router-link>
            </li>
          </ul>

          <!-- 查看更多提示 -->
          <router-link
            :to="`/u/${userInfo.username}/messages/receive`"
            v-show="showMoreIcon"
          >
            <!-- prettier-ignore -->
            <div
              class="w-23/25 mt-2 mx-auto h-8 text-center leading-10 cursor-pointer
                  bg-gray-200  hover:(bg-gray-300) transition-colors duration-300"
              title="查看更多"
              @click="visible = false"
            >
              <i class="el-icon-arrow-down" style="font-size: 1.5rem"></i>
            </div>
          </router-link>
        </div>
      </a-tab-pane>

      <!-- 收藏列表 -->
      <a-tab-pane key="2">
        <span slot="tab" class="py-3 space-x-2 tracking-wider">收藏</span>
        <p class="text-center text-gray-400 tracking-wider py-5">
          你还没有收藏哦 !
        </p>
      </a-tab-pane>

      <!-- 操作 -->
      <a-tab-pane key="3">
        <span slot="tab" class="py-3 space-x-2 tracking-wider">设置</span>
        <span slot="label" title="设置" class="tracking-wider">设置</span>
        <ul class="text-base">
          <li
            v-for="(item, index) in settingList"
            :key="index"
            class="hover:bg-gray-100 cursor-pointer rounded-md px-5 py-2 transition-colors duration-400"
            @click="visible = !visible"
          >
            <router-link
              :to="item.route"
              class="tracking-wider w-full inline-block"
            >
              <Icon :name="item.icon" size="1.05rem" className="mr-3" />
              {{ item.title }}
            </router-link>
          </li>
          <li
            class="hover:bg-gray-100 cursor-pointer rounded-md px-5 py-1 transition-colors duration-400"
            @click="logout"
          >
            <span class="cursor-pointer tracking-wider">
              <Icon name="logout" size="1rem" class="mr-3 pl-0.5" />
              退出登录
            </span>
          </li>
        </ul>
      </a-tab-pane>
    </a-tabs>
  </a-popover>
</template>

<script>
export default {
  name: "User",
  data() {
    return {
      visible: false,
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
      hasSetGrandWidth: false,
      // 最新私信是否已经查看，查看之后放置于历史私信中
      isPrivateScanned: false,
      // 列表最大渲染数量
      tabListLenLimit: 99,
      // 历史私信
      historyPrivateList: [],
      // 最新私信
      updatedPrivateList: [],
      // 收藏列表
      collectionList: [],
      // 轮询私信 interval
      pollUserPrivateTimer: null,
    };
  },
  computed: {
    userInfo() {
      return this.$attrs.userInfo;
    },
    showMoreIcon() {
      return false;
    },
  },
  filters: {
    formatTime: function (time) {
      return dateToTypes(time, true);
    },
    truncateTitle: (title) => {
      return title.length > 30 ? title.slice(0, 30) + "..." : title;
    },
  },
  mounted() {
    this.settingList.forEach(({ route }) => {
      route.params.username = this.userInfo.username;
    });
  },
  methods: {
    getRenderNode() {
      return document.getElementById("app");
    },
    onPanelShow(status) {
      if (status && !this.hasSetGrandWidth) {
        /**
         *  因不明原因
         *  popover 的祖父元素中的 width: 100% 会导致 popover 在点击 tabs 后自动变宽
         *  将其重置为 auto
         * */
        this.$nextTick(() => {
          const widthFullNodeChild =
            this.$root.$el.getElementsByClassName("ant-popover")[0];

          const widthFullNode = widthFullNodeChild.parentElement.parentElement;

          widthFullNode.style.width = "auto";

          this.hasSetGrandWidth = true;
        });
      }
    },
    async logout() {
      this.$store.dispatch("setEditorStatus", false);

      await this.$store.dispatch("logout");

      location.reload();
    },
  },
};
</script>

<style lang="postcss" scoped>
.user-panel >>> .ant-tabs-ink-bar {
  transition: all 0.3s ease-in-out 0s;
}

.user-panel >>> .ant-tabs-nav > div:first-of-type {
  @apply flex w-full space-x-6;

  div {
    margin: 0;
    flex: 1 1 auto;
    padding: 0 35px;
    height: 55px;
    line-height: 55px;
    font-size: 1rem;
    font-weight: 600;
  }
}
</style>
