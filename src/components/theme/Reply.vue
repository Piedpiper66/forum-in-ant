<template>
  <div class="border-b py-3">
    <!-- 快捷显示回复引用者的回复信息 -->
    <div class="flex w-full">
      <!-- 充当头像的占位符 -->
      <div class="empty-avatar w-11 mr-3"></div>
      <div class="flex flex-col flex-1">
        <transition name="fadeInOut" mode="out-in">
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
      @mouseenter="showResolve && (resolveIconShow = true)"
      @mouseleave="showResolve && (resolveIconShow = false)"
    >
      <!-- 左头像 -->
      <div class="px-3">
        <Avatar
          :src="reply.avatar"
          :username="reply.username"
          :userId="reply.userId"
          size="large"
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
              size="small"
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

        <!-- 正文  reply-content 类名作为渲染后的元素定位点 -->
        <section
          ref="content"
          v-html="reply.markdown || reply.content"
          class="reply-content my-5 select-text text-base"
        ></section>

        <!-- 交互区 -->
        <div class="flex justify-end space-x-1 items-center">
          <!-- 设置解决方案 -->
          <transition name="fadeInOut">
            <!-- 在该主题无解决方案且鼠标移入该回复时显示该元素 -->
            <span
              class="icon-box mr-2 space-x-2"
              v-show="resolveIconShow || reply.isSolution"
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
              @click="toggleTopicResolved"
            >
              <Icon name="correct" size="1.5rem" />
              <span
                v-show="reply.isSolution"
                class="font-semibold text-green-400 text-base"
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
            @click="handleSupport"
            :title="reply.isSupport ? '取消点赞' : '点赞该帖'"
          >
            <span v-if="reply.supportLen > 0">{{ reply.supportLen }}</span>
            <Icon :name="reply.isSupport ? 'like-filled' : 'like-outline'" />
          </span>

          <!-- 链接 -->
          <a-popover
            placement="top"
            :width="300"
            trigger="click"
            v-model="canlinkShow"
            @after-enter="handleLinkSelect"
          >
            <span
              class="flex items-center space-x-2 link-copy icon-box hover:(bg-gray-300 text-white) text-gray-400"
            >
              <Icon name="link" className="font-bold" size="1.45rem" />
            </span>

            <div class="flex flex-col" slot="content">
              <span class="text-gray-800 font-bold">
                <b>{{ reply.isCreator ? "主题" : "帖子" }}</b>
                #{{ reply.posi }}</span
              >
              <a-input
                size="small"
                :value="getHref()"
                class="border-none my-2"
                style="fontsize: 15px"
              ></a-input>
              <div class="flex justify-between text-lg items-center">
                <a
                  class="bg-green-400 px-2 text-white rounded-md inline-block"
                  @click.prevent="MailTo"
                  title="通过电子邮件发送"
                  :href="getHref()"
                >
                  <i class="el-icon-message font-bold"></i>
                </a>
                <span
                  class="hover:text-black cursor-pointer"
                  @click="() => (canlinkShow = false)"
                >
                  <i class="el-icon-close font-extrabold"></i>
                </span>
              </div>
            </div>
          </a-popover>

          <!-- 收藏 -->
          <span
            class="icon-box hover:(bg-gray-200 text-yellow-300)"
            :title="reply.isBookmark ? '取消收藏' : '收藏该贴'"
            @click="toggleBookmark"
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
            v-if="isLogin"
            class="icon-box text-gray-500 hover:(bg-gray-200 text-gray-700) space-x-1 select-none"
            @click="createReply"
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
      canlinkShow: false,
      timer: null,
      isSupport: false,
      resolveIconShow: false,
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
    currentRefIcon() {
      return this.isRefLoading ? "loading" : "reply";
    },
    ...mapGetters(["isLogin", "editorShow", "editorType", "userId"]),
  },
  // watch: {
  //   editorShow(status) {
  //     this.isEditorVisible = status;
  //   },
  // },
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
      pasteNode.classList.add("opacity-100");
    },
    onMouseLeavePre({ target: { pasteNode } }) {
      pasteNode.classList.remove("opacity-100");
    },
    // 复制 pre 节点中的内容
    onPasteNodeClick({ target: { parentElement } }) {
      const pasteContent = parentElement.innerText;

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

      copyResult && this.$message.success("代码复制成功");
    },
    // 创建复制图标并置于 pre 节点的右上角
    generatePasteIcon() {
      const i = document.createElement("i");

      Object.assign(i.style, {
        position: "absolute",
        right: "1rem",
        top: ".5rem",
      });

      i.title = "点击复制代码";

      // prettier-ignore
      i.className =
        `iconfont icon-paste text-gray-400 cursor-pointer
        transition-opacity duration-300 opacity-0`;

      // 防抖，防止快速点击导致的内存资源消耗
      i.onclick = (e) => {
        return this.throttle(this.onPasteNodeClick, 800, true, this)(e);
      };

      return i;
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
          }, 500);
        }
      }
    },

    // ----------------------------- 交互按钮功能 ------------------------- //
    // 点赞
    handleSupport() {
      console.log("support!");
    },
    // 链接
    handleLinkSelect() {
      console.log("select");
    },
    getHref() {
      return location.href;
    },
    async MailTo() {
      const theme = this.reply.topicTitle;
      const content = location.href;
      window.open("mailto:?subject=[Rao Forum]" + theme + "&body=" + content);
    },
    // 收藏
    toggleBookmark() {
      console.log("toggle mark!");
      this.reply.isBookmark = !this.reply.isBookmark;
    },
    // 回复主题或用户
    createReply() {
      const {
        isCreator,
        themeTitle: title,
        topicId: themeId,
        userId,
        avatar,
        username,
        _id: prepareGotoReplyId,
        posi,
        categoryId,
        createTime,
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
    async toggleTopicResolved() {
      const canToggle = this.isLogin && this.userId === this.reply.creatorId;
      // console.log(this.userId, this.reply.creatorId, canToggle);
      if (!canToggle) return;
      const type = this.isSolution ? "remove" : "add";
      const { topicId, _id, username, reply_user, avatar } = this.reply;
      const {
        data: { code, data, message },
      } = await this.$api.setResolve({
        topicId,
        username,
        userId: reply_user,
        avatar,
        replyId: _id,
        type,
      });
      // log("resolve res", [code, data, message]);
      if (code === 200 && data.ok && data.nModified) {
        // log(data);
        this.$bus.$emit("toggleTopicResolved", {
          replyId: _id,
          username,
          userId: reply_user,
          avatar,
        });
      }
    },
  },
};
</script>
