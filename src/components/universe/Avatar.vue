<template>
  <a-popover
    :visible="visible"
    trigger="click"
    placement="rightTop"
    :destroyTooltipOnHide="true"
    @click.native="onPopElClick"
  >
    <a-badge
      :count="$attrs.messageCount"
      :overflow-count="$attrs.maxMessageCount"
    >
      <div
        class="cursor-pointer"
        :title="username + ($attrs['extra-title'] || '')"
      >
        <a-avatar
          :size="size"
          :src="src"
          ref="avatar"
          alt="无"
          class="transform transition-all duration-300 select-none"
          :class="{ 'shadow-lg hover:(scale-115 shadow-xl)': userId }"
        >
          <Icon name="user" slot="icon" />
        </a-avatar>
      </div>
    </a-badge>
    <span slot="content" class="inline-flex space-x-3" style="width: 520px">
      <!-- :info="userInfo" :loading="cardLoading" -->
      <UserCard :show="visible" :userId="userId" />
    </span>
  </a-popover>
</template>

<script>
import { isNodeInParent } from "../../utils/document";

export default {
  name: "Avatar",
  props: {
    username: {
      type: String,
      default: "anonymous",
    },
    src: {
      // 头像路径
      type: String,
      default: "",
    },
    userId: [String, Number],
    skip: {
      // 点击头像是否弹出卡片
      type: Boolean,
      default: false,
    },
    size: {
      // 头像大小
      type: [String, Number],
      default: "default",
    },
    scale: {
      type: Number,
      default: 120,
    },
  },
  data() {
    return {
      visible: false,
      isAvatarClicked: false,
      hasSetListener: false,
      userInfo: null,
      // cardLoading: true,
      cardShow: false,
    };
  },
  watch: {
    visible(status) {
      // popover 关闭时移除监听器，打开时启动监听器
      const action = status ? "add" : "remove";

      window[`${action}EventListener`]("click", this.handleClick);

      !status && (this.cardLoading = true);

      // 打开时: 当点击非 popover 区域时，popover 应该被关闭
      this.hasSetListener = this.isAvatarClicked = status;
    },
  },
  beforeDestroy() {
    if (this.$options.container) {
      window.removeEventListener("click", this.handleClick);
    }
  },
  methods: {
    async onPopElClick(e) {
      if (this.skip) return false;

      if (!this.userId || !this.src) {
        this.userInfo = null;
        this.$message.info("该用户不存在或已注销");
        return false;
      }

      this.isAvatarClicked = !this.isAvatarClicked;

      if (!this.isAvatarClicked) {
        this.visible = false;
        return false;
      }

      // 没有放在 watcher 中是因为是只有点击了的头像才应该设置 container，否则出现冗余
      if (!this.hasSetListener) {
        setTimeout(() => {
          // 挂载到 options 中，避免重复查找
          // 要配合 popover 中 destroyTooltipOnHide="true"，否则会出现多个 .ant-popover 元素
          // prettier-ignore
          this.$options.container = document.getElementsByClassName("ant-popover")[0];
        });
      }

      this.visible = true;
    },
    /**
     * @param { Event } e
     */
    handleClick(e) {
      const target = e.target;

      const avatarEl = this.$refs.avatar.$el;

      const isAvatar = target.parentElement === avatarEl || target === avatarEl;

      // 如果点击的是头像则忽略，组件自身会处理，否则会出现闪烁
      if (isAvatar) {
        return false;
      }

      const result = isNodeInParent(target, this.$options.container);

      // 如果点击的不是卡片内部，则关闭卡片
      if (!result) this.visible = false;
    },
  },
};
</script>
