<template>
  <a-popover
    :visible="visible"
    trigger="click"
    placement="rightTop"
    :destroyTooltipOnHide="true"
    @click.native="onPopElClick"
  >
    <img
      :src="imgSrc"
      :style="imgStyle"
      :title="username + ($attrs['extra-title'] || '')"
      ref="avatar"
      alt="无"
      class="cursor-pointer inline-block transform-gpu transition-all duration-300 select-none rounded-1/2"
      :class="{ 'shadow-lg hover:(scale-115 shadow-xl)': !!userId }"
    />
    <span slot="content" class="inline-flex space-x-3" style="width: 520px">
      <UserCard :show="visible" :userId="userId" @close="visible = false" />
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
      default: 35,
    },
    noSize: {
      type: Boolean,
      default: false,
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
      cardShow: false,
    };
  },
  computed: {
    imgSrc() {
      return this.src ? this.src : require("../../assets/img/no-avatar.png");
    },
    imgStyle() {
      const isNumber = this.isPureNumber(this.size);
      const currPixel = isNumber ? `${this.size}px` : this.size;
      return {
        height: "auto",
        // height: this.noSize ? "inherit" : currPixel,
        width: currPixel,
        // lineHeight: this.noSize ? this.size - 3 + "px" : "auto",
        minWidth: "30px",
        minHeight: "30px",
      };
    },
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
          this.$options.container = window.document.getElementsByClassName("ant-popover")[0];
        });
      }
      this.visible = true;
    },
    /**
     * @param { Event } e
     */
    handleClick(e) {
      const target = e.target;
      const avatarEl = this.$refs.avatar;

      const isLink = target.dataset.link !== void 0;

      // 如果点击的是头像则忽略，组件自身会处理，否则会出现闪烁
      if (target === avatarEl) {
        return false;
      }

      const result = isNodeInParent(target, this.$options.container);

      // 如果点击的不是卡片内部或者点击的是卡片中的头像和用户名，则关闭卡片
      if (!result || isLink) this.visible = false;

      console.log(this.visible);
    },
    isPureNumber(number) {
      return parseInt(number) === number;
    },
  },
};
</script>
