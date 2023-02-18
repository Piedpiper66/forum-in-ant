<template>
  <div class="border-b py-3">
    <!-- 快捷显示回复引用者的回复信息 -->
    <div class="flex w-full">
      <!-- 充当头像的占位符 -->
      <div class="empty-avatar w-11 mr-3"></div>
      <div class="flex flex-col flex-1">
        <transition
          name="fadeInOut"
          mode="out-in"
          @after-leave="afterRefLeave"
          ref="refreply"
        >
          <RefReply
            v-if="isRefVisible"
            :refDetail="refDetail"
            @toggle="isRefVisible = false"
          />
        </transition>
      </div>
    </div>

    <!-- 主内容 -->
    <div
      class="flex w-full"
      @mouseenter="showResolve && (hoverReplyShowResolve = true)"
      @mouseleave="showResolve && (hoverReplyShowResolve = false)"
    >
      <!-- 左头像 -->
      <div class="px-3">
        <Avatar
          :src="reply.avatar"
          :username="reply.username"
          :userId="reply.userId"
          :size="45"
        />
      </div>

      <!-- 右内容 -->
      <div class="flex flex-1 flex-col px-3">
        <!-- 用户名 | 回复引用 | 时间 -->
        <div class="flex justify-between items-center">
          <!-- 用户名 -->
          <div class="space-x-3 flex items-center">
            <div class="font-bold text-gray-400 text-lg text-shadow">
              {{ reply.username || "该账户已注销" }}
            </div>
            <!-- 如果存在回复引用，则显示该回复的回复时间 -->
            <div
              class="text-gray-400"
              v-if="reply.to"
              v-date.live.suffix="reply.createTime"
              title="创建时间"
            ></div>
          </div>

          <!-- 引用回复 -->
          <div class="flex space-x-2 items-center" v-if="reply.to">
            <!-- icon -->
            <Icon
              :name="currentRefIcon"
              className="transform rotate-y-180"
              size="1rem"
              :spin="currentRefIcon === 'loading'"
            />
            <!-- 引用回复的用户头像 -->
            <Avatar
              :size="30"
              :src="reply.to.avatar"
              :skip="true"
              username="加载该回复信息"
              @click.native="onClickReference"
            />
            <!-- 用户名 -->
            <div class="text-gray-500">{{ reply.to.username }}</div>
            <!-- 引用回复的创建时间 -->
            <div
              class="text-gray-400 text-xs"
              v-date.live.suffix="reply.to.createTime"
              title="该引用回复的创建时间"
            ></div>
          </div>

          <!-- 如果引用不存在，则显示该回复的时间 -->
          <div
            v-else
            class="text-gray-400"
            v-date.live.suffix="reply.createTime"
            title="创建时间"
          ></div>
        </div>

        <!-- 正文  markdown 类名作为渲染后的元素定位点 -->
        <section
          ref="content"
          v-html="reply.markdown || reply.content"
          class="md-content my-5 select-text text-base"
        ></section>

        <!-- 交互区 -->
        <div class="flex justify-end space-x-1 items-center">
          <!-- 设置解决方案  BUG: 不是用于的帖子可以取消该贴为解决方案 -->
          <transition name="fadeInOut">
            <!-- 在该主题无解决方案且鼠标移入该回复时显示该元素 -->
            <span
              class="icon-box mr-2 space-x-2"
              v-if="showResolve"
              v-show="canResolveIconToggle"
              :title="
                reply.isSolution ? '该回复为解决方案' : '设置该贴为解决方案'
              "
              :class="[
                reply.isSolution
                  ? isLogin && userId === reply.reply_user
                    ? 'cursor-pointer text-green-300 hover:(bg-gray-100)'
                    : 'text-green-300 cursor-default'
                  : 'cursor-pointer hover:(bg-green-300 text-white)',
              ]"
              @click="toggleThemeResolved"
            >
              <Icon name="correct" />
              <span
                v-show="reply.isSolution"
                class="font-semibold text-green-400 text-[15px]"
              >
                解决方案
              </span>
            </span>
          </transition>

          <!-- 点赞 -->
          <span
            class="support icon-box text-gray-400 flex items-center space-x-2"
            :class="[
              reply.isSupport
                ? 'hover:(bg-gray-200)'
                : 'hover:(bg-red-200 text-red-600)',
            ]"
            @click="onSupport"
            :title="reply.isSupport ? '取消点赞' : '点赞该帖'"
          >
            <span v-if="reply.supportLen > 0">{{ reply.supportLen }}</span>
            <Icon
              :name="reply.isSupport ? 'like-filled' : 'like-outline'"
              :class="reply.isSupport ? 'text-red-400' : 'text-gray-400'"
            />
          </span>

          <!-- 链接 -->
          <a-popover
            placement="top"
            :width="300"
            trigger="click"
            v-model="canlinkShow"
            @visibleChange="handleLinkPopoverVisible"
          >
            <span
              class="flex items-center space-x-2 link-copy icon-box hover:(bg-gray-200) text-gray-400"
            >
              <Icon name="link" className="font-bold" size="1.45rem" />
            </span>

            <div class="flex flex-col p-2 space-y-2" slot="content">
              <span class="text-gray-800 font-bold">
                <b>{{ reply.isCreator ? "主题" : "帖子" }}</b>
                #{{ reply.posi }}
              </span>

              <a-input
                :value="`${href}${reply.isCreator ? '' : `?rId=${reply._id}`}`"
                ref="linkIpt"
              ></a-input>

              <div class="flex justify-between text-lg items-center">
                <a
                  class="table bg-green-400 px-2 py-1 !text-white rounded-md hover:(bg-green-500)"
                  @click.prevent="MailTo"
                  title="通过电子邮件发送"
                  :href="href"
                >
                  <Icon name="mail" class="table-cell align-middle" />
                </a>
                <span
                  class="cursor-pointer"
                  @click="() => (canlinkShow = false)"
                >
                  <Icon
                    name="close"
                    class="text-gray-400 hover:text-gray-600"
                  />
                </span>
              </div>
            </div>
          </a-popover>

          <!-- 收藏 -->
          <span
            class="icon-box hover:(bg-gray-200 text-yellow-300)"
            :title="reply.isBookmark ? '取消收藏' : '收藏该贴'"
            @click="onBookmark"
          >
            <Icon
              :name="reply.isBookmark ? 'bookmark' : 'bookmark-line'"
              size="1.3rem"
              :className="
                reply.isBookmark ? 'text-yellow-300' : 'text-gray-400'
              "
            ></Icon>
          </span>

          <!-- 回复 -->
          <span
            class="icon-box text-gray-500 hover:(bg-gray-200 text-gray-700) space-x-1 select-none"
            @click="invokeEditorWithReply"
            title="回复该贴"
          >
            <Icon name="reply" />
            <span>回复</span>
          </span>
        </div>

        <!-- 主题的数据统计 -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import hljs from "mavon-editor/dist/highlightjs/highlight.min.js";
import RefReply from "./RefReply.vue";
import { mapGetters } from "vuex";

export default {
  name: "Reply",
  components: {
    RefReply,
  },
  inject: ["href", "freshOffsets"],
  props: {
    reply: {
      type: Object,
      default: () => {},
    },
    // 该回复是否显示已解决 icon
    showResolve: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 控制 link popover 的显隐
      canlinkShow: false,
      timer: null,
      // 是否已经点击点赞
      isToggleSupport: true,
      // 是否已经点击收藏
      isToggleBookmark: true,
      // 用于控制鼠标悬停和离开 reply 时 resolveIcon 的显隐
      hoverReplyShowResolve: false,
      // 是否已经转换了 reoslveIcon 状态
      isToggleResolve: true,
      // 引用回复加载
      isRefLoading: false,
      // 加载后的引用是否可见
      isRefVisible: false,
      // 引用回复的数据
      refDetail: null,
      // 编辑器是否可见
      isEditorVisible: false,
    };
  },
  computed: {
    ...mapGetters(["isLogin", "editorShow", "editorType", "userId"]),
    // 用于标记是主题还是回复
    isTheme() {
      return this.reply.isCreator;
    },
    isLiked() {
      return this.reply.isSupport;
    },
    isBkMk() {
      return this.reply.isBookmark;
    },
    isSolution() {
      return this.reply.isSolution;
    },
    currentRefIcon() {
      return this.isRefLoading ? "loading" : "reply";
    },
    clickIconThrottleFn() {
      return this.throttle(this.onPasteNodeClick, 800, true, this);
    },
    canResolveIconToggle() {
      return this.hoverReplyShowResolve || this.isSolution;
    },
  },
  mounted() {
    const content = this.$refs.content.querySelectorAll("pre");

    if (content && content.length) {
      content.forEach((el) => {
        hljs.highlightElement(el);

        el.classList.add("relative");

        const pasteNode = this.generatePasteIcon();
        el.appendChild(pasteNode);
        // 添加至其属性中，省去每次查找的时间
        el.pasteNode = pasteNode;

        el.onmouseenter = this.onMouseEnterPre;
        el.onmouseleave = this.onMouseLeavePre;
      });
    }
  },
  methods: {
    onMouseEnterPre({ target: { pasteNode } }) {
      pasteNode.classList.remove("opacity-0");
      pasteNode.classList.add("icon-paste");
      pasteNode.textContent = "";
    },
    onMouseLeavePre({ target: { pasteNode } }) {
      pasteNode.classList.add("opacity-0");
    },
    // 复制 pre 节点中的内容
    onPasteNodeClick({ target }) {
      const pasteContent = target.parentElement.innerText;

      /**
       * document.execCommand 方法只能复制 input 或 textarea 等节点中的内容
       * 其中 input 方法复制的内容不会换行
       * 需要换行则使用 textarea 进行复制
       */
      const textarea = document.createElement("textarea");

      // 防止在 ios 下弹出键盘
      textarea.readOnly = true;

      textarea.value = pasteContent;

      document.body.appendChild(textarea);

      // 防止在 ios 下复制的内容不完整
      textarea.setSelectionRange(0, pasteContent.length || 9999);

      textarea.select();

      // 执行复制命令
      const copyResult = document.execCommand("copy");

      document.body.removeChild(textarea);

      if (copyResult) {
        target.classList.remove("icon-paste");
        target.textContent = "✔ 已复制";
      }
    },
    // 创建复制图标并置于 pre 节点的右上角
    generatePasteIcon() {
      const pasteNode = document.createElement("span");

      Object.assign(pasteNode.style, {
        position: "absolute",
        right: "1rem",
        top: ".5rem",
      });

      pasteNode.title = "点击复制代码";

      // prettier-ignore
      pasteNode.className =
        `iconfont icon-paste text-gray-400 cursor-pointer
        transition-opacity duration-300 opacity-0`;

      // 防抖，防止快速点击导致的内存资源消耗
      pasteNode.onclick = this.clickIconThrottleFn;

      return pasteNode;
    },
    async onClickReference() {
      if (!this.isRefLoading) {
        // 当显示 refReply后再点击，折叠 refReply
        if (this.isRefVisible) {
          this.isRefVisible = false;
        } else {
          this.isRefLoading = true;

          const ref = await this.$api.getReplyDetail({
            replyId: this.reply.to.replyId,
          });

          this.refDetail = Object.freeze(ref);

          setTimeout(() => {
            ref && (this.isRefVisible = true);

            !ref && this.$message.error("服务器出了些小问题, 请重试");

            this.isRefLoading = false;

            this.$nextTick(() => {
              this.freshOffsets();
            });
          }, 500);
        }
      }
    },
    afterRefLeave() {
      this.$nextTick(() => {
        this.freshOffsets();
      });
    },
    // ----------------------------- 交互按钮功能 ------------------------- //
    // 点赞
    async onSupport() {
      if (!this.isLogin) {
        this.$message.info("请先登录");
        return;
      }

      if (!this.isToggleSupport) return;

      this.isToggleSupport = false;

      const result = await this.$api.toggleSupport({
        ope: +!this.isLiked, // false => 1, true => 0
        theme: this.isTheme,
        to: this.reply.reply_user,
        id: this.reply._id,
      });

      if (result && result.status === "success") {
        this.$emit("toggleSupport");
      } else {
        this.$message.error("出了点小问题，请稍后再试");
      }

      this.isToggleSupport = true;
    },
    // 链接
    handleLinkPopoverVisible(status) {
      // linkIpt 可能还没渲染出来
      this.$nextTick(() => {
        const iptRef = this.$refs.linkIpt.$el;
        if (status) {
          iptRef.select();
        } else {
          iptRef.blur();
        }
      });
    },
    // 打开系统的邮箱 app
    MailTo() {
      window.open(
        "mailto:?subject=[Rao Forum]" +
          this.reply.themeTitle +
          "&body=" +
          encodeURIComponent(this.href)
      );
    },
    // 收藏
    async onBookmark() {
      if (!this.isLogin) {
        this.$message.info("请先登录");
        return;
      }

      if (!this.isToggleBookmark) return;

      this.isToggleBookmark = false;

      const result = await this.$api.toggleBookmark({
        ope: +!this.isBkMk, // false => 1, true => 0
        theme: this.isTheme,
        to: this.reply.reply_user,
        id: this.reply._id,
        date: Date.now(),
      });

      if (result && result.status === "success") {
        this.$emit("toggleBookmark");
      } else {
        this.$message.error("出了点小问题，请稍后再试");
      }

      this.isToggleBookmark = true;
    },
    // 回复主题或用户
    invokeEditorWithReply() {
      if (!this.isLogin) {
        this.$message.info("请先登录");
        return;
      }

      // prettier-ignore
      const {
        isCreator, themeTitle: title, topicId: themeId, _id: prepareGotoReplyId,
        userId, avatar, username, posi, categoryId,createTime,
      } = this.reply;

      if (!username) {
        this.$message.info("该用户已注销!");
        return false;
      }

      const currentType = isCreator ? "replyToTheme" : "replyToUser";

      let editorNoNeedToClose = false;

      if (this.editorType.type.includes("reply")) {
        // prettier-ignore
        const { info: { _id: currentReplyId } } = this.editorType;

        // 在当前编辑器为开启状态且点击的不是不同一个回复按钮时，不用关闭, 直接切换视图
        // prettier-ignore
        editorNoNeedToClose = this.editorShow && prepareGotoReplyId !== currentReplyId;
      }

      // prettier-ignore
      const info = {
        title, themeId, _id: prepareGotoReplyId, markdown: "", content: "",
        userId, avatar, username, categoryId, createTime
      };

      !isCreator && Object.assign(info, { floor: posi - 1 });

      this.$store.dispatch("setEditorStatus", {
        show: editorNoNeedToClose || !this.editorShow,
        type: currentType,
        info,
      });
    },
    // 设置或取消当前回复为解决方案
    async toggleThemeResolved() {
      if (this.canResolveIconToggle && this.isToggleResolve) {
        this.isToggleResolve = false;

        const { topicId, _id, username, reply_user, avatar } = this.reply;
        // prettier-ignore
        const data = await this.$api.toggleThemeResolve({
          type: +!this.isSolution, // false => 1, true: 0
          topicId, replyId: _id,
          userId: reply_user, username, avatar,
        });

        if (data && data.status === "success") {
          const message = this.isSolution ? "已取消" : "设置成功";
          this.$message.success(message);

          if (this.isSolution) {
            this.hoverReplyShowResolve = true;
          }

          this.$emit("toggleResolved");
        } else {
          this.$message.error("设置失败");
        }

        this.isToggleResolve = true;
      }
    },
  },
};
</script>
