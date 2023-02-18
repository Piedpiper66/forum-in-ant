<template>
  <a-popover
    v-model="visible"
    trigger="click"
    placement="bottomRight"
    :overlayStyle="{ zIndex: 1101 }"
    class="userpanel"
    :getPopupContainer="() => $root.$el"
    @visibleChange="onPanelShow"
  >
    <a-badge :count="updatedLen" :overflow-count="50">
      <img
        :src="userInfo.avatar"
        class="rounded-1/2 w-8.5 h-8.5 cursor-pointer shadow-md"
      />
    </a-badge>

    <a-tabs
      slot="content"
      v-model="currTabKey"
      :tabBarStyle="{ userSelect: 'none' }"
      :animated="false"
      @change="onTabChange"
      class="user-panel"
    >
      <!-- 私信列表 -->
      <a-tab-pane :key="tab_p" @click.native="visible = false">
        <span slot="tab" class="py-3 space-x-2 tracking-wider">私信</span>
        <!-- #BUG: 滚动到顶部或底部会导致 document 也滚动 -->
        <PrivatePanel
          :visible="visible"
          :isScanned="isPrivateScanned"
          :username="userInfo.username"
          @setUpdatedLen="(len) => (updatedLen = len)"
          ref="private"
        />
      </a-tab-pane>

      <!-- 收藏列表 -->
      <a-tab-pane :key="tab_s" @click.native="visible = false">
        <span slot="tab" class="py-3 space-x-2 tracking-wider">关注</span>
        <SubscribePanel :visible="visible" />
      </a-tab-pane>

      <!-- 操作 -->
      <a-tab-pane :key="tab_set" @click.native="visible = false">
        <span slot="tab" class="py-3 space-x-2 tracking-wider">设置</span>
        <SettingPanel :username="userInfo.username" />
      </a-tab-pane>
    </a-tabs>
  </a-popover>
</template>

<script>
import PrivatePanel from "./user/PrivatePanel.vue";
import SubscribePanel from "./user/SubscribePanel.vue";
import SettingPanel from "./user/SettingPanel.vue";

export default {
  name: "User",
  components: {
    PrivatePanel,
    SubscribePanel,
    SettingPanel,
  },
  data() {
    return {
      visible: false,
      currTabKey: "2",
      tab_p: "1",
      tab_s: "2",
      tab_set: "3",
      updatedLen: 0,
      hasSetGrandWidth: false,
      isPrivateScanned: false,
    };
  },
  computed: {
    userInfo() {
      return this.$attrs.userInfo;
    },
  },
  mounted() {},
  methods: {
    onPanelShow(status) {
      // 刚打开，且当前为私信 Tab 则表示已经浏览
      if (status && this.currTabKey === "1") {
        this.isPrivateScanned = true;
      }

      if (status && !this.hasSetGrandWidth) {
        /**
         *  因不明原因
         *  popover 的祖父元素中的 width: 100% 会导致 popover 在点击 tabs 后自动变宽
         *  将其重置为 auto
         * */
        this.$nextTick(() => {
          // const widthFullNodeChild =
          //   this.$root.$el.getElementsByClassName("ant-popover")[0];
          // const widthFullNode = widthFullNodeChild.parentElement.parentElement;
          // widthFullNode.style.width = "auto";
          // this.hasSetGrandWidth = true;
        });
      }

      // 打开后且查看了最新消息后，通过新消息个数的徽标要置空
      // 即将 updateList 清空，并放入 historyList 中
      if (!status && this.isPrivateScanned) {
        this.$refs.private.onScannedUpdatedPrivate();
      }
    },
    onTabChange(activeKey) {
      if (activeKey === "1") this.isPrivateScanned = true;
    },
  },
};
</script>

<style lang="postcss" scoped>
.user-panel {
  @apply max-w-90;
}

.user-panel >>> .ant-tabs-ink-bar {
  transition: all 0.3s ease-in-out 0s;
}

.user-panel >>> .ant-tabs-content {
  padding-bottom: 1rem;
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
