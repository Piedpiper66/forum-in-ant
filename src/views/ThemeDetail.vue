<template>
  <page-loading :loading="!isLoaded">
    <!-- 加载完毕且有数据才显示 -->
    <div id="detail" v-if="contentVisibe" key="content" @click="onScaleImage">
      <!-- 话题标题 -->
      <section class="flex flex-col flex-wrap w-9/10 pt-5 mb-3 pb-5">
        <!-- 标题 -->
        <h1 class="w-full text-2xl font-semibold font-sans mb-1 text-gray-700">
          {{ detail.title }}
        </h1>
        <!-- 标签 -->
        <div class="space-x-3">
          <Type
            :name="detail.category[0].name"
            :title="detail.category[0].description"
          />
          <Type v-for="tag in detail.tags" :key="tag" :name="tag" />
        </div>
      </section>

      <div class="flex">
        <!-- 主内容 占据宽度 2/3 -->
        <div id="detail-content" class="flex-[2]">
          <div class="h-0 border-b-3 rounded-md"></div>
          <reply
            v-for="(reply, index) in detail.replies"
            :key="index"
            :reply="reply"
            ref="reply"
            :showResolve="shouldShowResolveIcon"
            @hook:mounted="collectVNodesOffset(index)"
            @moveToRef="handleReplyMove"
          >
            <!-- 主题的统计信息 -->
            <div
              v-if="!index"
              class="px-3 py-2 bg-gray-100 rounded-md mt-5 flex space-x-5 shadow-md"
            >
              <!-- 创建时间 -->
              <div class="reply-create-time flex-shrink-0 space-y-1">
                <div class="text-gray-500 text-sm">创建时间</div>
                <div class="flex items-center space-x-1">
                  <Avatar
                    :username="reply.username"
                    :userId="reply.reply_user"
                    :size="22"
                    :src="reply.avatar"
                  />
                  <span
                    class="text-gray-800 transform translate-y-0.5"
                    v-date.live.suffix="reply.createTime"
                  ></span>
                </div>
              </div>

              <!-- 最后回复 -->
              <div class="last-activity flex-shrink-0 space-y-1">
                <div class="text-gray-500 text-sm">最后回复</div>
                <div class="flex items-center space-x-1">
                  <!-- <div class="user-avatar-test transform scale-60"></div> -->
                  <Avatar
                    :username="lastReply.username"
                    :userId="lastReply.reply_user"
                    :src="lastReply.avatar"
                    :size="22"
                  />
                  <span
                    class="text-gray-800 transform translate-y-0.5"
                    v-date.live.suffix="lastReply.createTime"
                  ></span>
                </div>
              </div>

              <!-- 数据统计 -->
              <div
                class="data-container flex space-x-5 flex-wrap items-center min-w-92"
                v-if="true"
              >
                <div class="flex flex-col items-center">
                  <span class="text-gray-600 text-xl">{{
                    detail.viewCount
                  }}</span>
                  <span class="text-gray-500 text-sm self-center">浏览</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-gray-600 text-xl">{{
                    detail.replies.length - 1
                  }}</span>
                  <span class="text-gray-500 text-sm self-center">回复</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-gray-600 text-xl">{{
                    distinctReply.length
                  }}</span>
                  <span class="text-gray-500 text-sm self-center">用户</span>
                </div>
                <div
                  class="reply-avatars flex items-center space-x-1 flex-wrap"
                >
                  <Avatar
                    v-for="reply in distinctReply.slice(0, 4)"
                    :key="reply.createTime"
                    :username="reply.username"
                    :userId="reply.reply_user"
                    :size="33"
                    :src="reply.avatar"
                    :count="reply.count"
                  />
                </div>
              </div>
            </div>
          </reply>
        </div>

        <!-- 时间线 占据宽度 1/3 -->
        <div
          id="timeline"
          class="hidden lg:flex flex-1 justify-center select-none ml-3"
        >
          <!-- 
              sticky 生效的注意事项
              1. 父元素不能overflow:hidden或者overflow:auto属性
              2. 必须指定top、bottom、left、right4个值之一，否则只会处于相对定位
              3. 父元素的高度不能低于sticky元素的高度
           -->
          <div
            class="sticky top-30 h-max text-base"
            v-if="true || (timeList && timeList.length > 0)"
          >
            <TimeLine :offsets="replyTopOffsets" :times="timeList" />
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="isLoaded && !detail"
      class="w-full h-leave-header flex items-center justify-center"
    >
      <a-result
        status="404"
        title="啊偶, 你访问的主题不存在"
        sub-title="有理由怀疑你在地址上瞎搞 !"
        class="transform -translate-y-30"
      >
        <template #extra>
          <a-button type="primary" @click="$router.go(-1)">
            返回上一页
          </a-button>
        </template>
      </a-result>
    </div>
  </page-loading>
</template>

<script>
import Reply from "../components/theme/Reply.vue";
import TimeLine from "../components/theme/TimeLine.vue";
import { timeFormat } from "../utils/format";
import Photo from "../components/universe/ImageViewer.vue";

// 所有回复中的内容中存在的图片，用于懒加载
let lazyImges = [];

const viewport = document.documentElement;

export default {
  name: "ThemeDetail",
  inject: ["appReload"],
  components: {
    Reply,
    TimeLine,
  },
  // provide() {
  //   return {
  //     PhotoVNode: Photo,
  //   };
  // },
  data() {
    return {
      isLoaded: false,
      detail: null,
      // 所有 reply 距离页面顶部的偏移量
      replyTopOffsets: [],
      // 所有回复的创建时间组成的数据
      timeList: [],
      timer: null,
    };
  },
  computed: {
    contentVisibe() {
      return this.isLoaded && this.detail;
    },
    replyVnodes() {
      return this.$refs.reply;
    },
    themeReplies() {
      return this.detail.replies;
    },
    lastReply() {
      return this.themeReplies[this.themeReplies.length - 1];
    },
    // 不同的回复用户
    distinctReply() {
      const distinct = [];

      this.themeReplies.forEach((reply) => {
        const target = distinct.find(
          (item) => item.reply_user === reply.reply_user
        );
        !target ? distinct.push(reply) : reply.count++;
      });

      return distinct;
    },
    format() {
      return (time) => timeFormat(time, false);
    },
    // 是否显示解决方案的图标
    shouldShowResolveIcon() {
      // 已登录 + 该贴是登录用户创建 + 帖子未含有解决方案 + 帖子不是第一个
      return (
        this.isLogin &&
        this.userId === this.topicDetail.creatorId &&
        !this.topicDetail.isResolve
      );
    },
  },
  watch: {
    $route: {
      handler({ params: { themeId } }) {
        this.isLoaded = false;

        this.copeDetailFetch(themeId);
      },
      immediate: true,
    },
    replyTopOffsets() {
      const { rId } = this.$route.query;

      if (rId) {
        setTimeout(() => {
          this.handleReplyMove(rId);
        }, 500);
      }

      lazyImges = [].slice.call(document.querySelectorAll("img[data-src]"));

      this.lazyloadImg(lazyImges);
    },
  },
  async mounted() {
    window.addEventListener("scroll", this.onPageScroll);

    this.$bus.$on("moveToRef", this.handleReplyMove);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onPageScroll);

    this.setHeaderTitle(null);
  },
  methods: {
    async copeDetailFetch(themeId) {
      // 用于统计用户是否已阅读该话题
      const userId = JSON.parse(localStorage.getItem("forum_u_id"));

      // prettier-ignore
      const result = await this.$api.getTopicDetail(themeId, userId);

      if (!result) {
        this.isLoaded = true;
        return false;
      }

      const theme = result[0];

      const replies = theme.replies;

      /**
       * 给 topic.replies 的头部添加一个由 topic 自身构成的 reply
       * 即整个 Topic 是由一个 reply 数组构成的
       */
      replies.unshift(this.generateReply(theme));

      // 给每个 reply 添加额外属性，以辅助业务逻辑
      replies.forEach((reply, index) =>
        this.setExtraProperty(theme, reply, index)
      );

      this.timeList = replies.map(({ createTime }) => createTime);

      this.detail = theme;

      setTimeout(() => (this.isLoaded = true), 300);
    },
    generateReply(topic) {
      return {
        supports: topic.supports,
        categoryId: topic.categoryId,
        topicId: topic._id,
        _id: topic._id,
        reply_user: topic.creatorId,
        createTime: topic.createDate,
        content: topic.content,
        markdown: topic.markdown,
        ...topic.creatorInfo,
      };
    },
    setExtraProperty(theme, reply, index) {
      const { isResolve, solution, creatorId } = theme;

      Object.assign(reply, {
        creatorId,
        // 是否是主题的作者
        isCreator: index === 0,
        // 当前 reply 的下标从 1 开始，以辅助时间线的运转
        posi: index + 1,
        // 该 reply 的获得的点赞数
        supportLen: reply.supports.length,
        // 该主题的标题
        themeTitle: theme.title,
        // 主题创建时间
        themeCreateTime: theme.createDate,
        // 该回复是否是解决方案
        // 需要满足两个条件: 1. 主题存在解决方案, 2. 该回复的 id 与 solution 的 id 对应
        isSolution: isResolve && solution.replyId === reply._id,
        // 该主题的回复数量
        repliesLen: theme.replies.length,
      });
    },
    // 单独配置用于清除滚动事件
    onPageScroll() {
      this.throttle(this.toggleHeaderTitle, 100, true, this)();
    },
    // 控制头部标题的显隐
    toggleHeaderTitle() {
      const scrollY = window.pageYOffset;

      if (scrollY >= 60) {
        const { title, category, tags } = this.detail;

        // 根据当前的话题类目与标签添加额外信息
        const info = { title };

        if (category || category.length) {
          const cate = category[0];
          info["category"] = {
            description: cate.description,
            name: cate.name,
            alias: cate.alias,
          };
        }

        tags && (info["tags"] = tags.map((i) => i));

        this.setHeaderTitle(Object.freeze(info));
      } else {
        this.setHeaderTitle(null);
      }

      // 用于图片懒加载
      lazyImges.length && this.lazyloadImg(lazyImges);
    },
    setHeaderTitle(info) {
      this.$bus.$emit("titleEmerge", info);
    },

    // ------------------------- 回复组件相关 ---------------------------
    handleReplyMove(replyId) {
      const targetReplyIndex = this.themeReplies.findIndex(
        ({ _id }) => _id === replyId
      );

      // console.log(this.$refs);
      const currVNode = this.$refs.reply[targetReplyIndex];

      if (currVNode) {
        const targetEl = currVNode.$el;

        const targetOffset = this.replyTopOffsets[targetReplyIndex];

        targetEl.classList.add("move-to-animation");

        window.scrollTo({ top: targetOffset, behavior: "smooth" });

        setTimeout(() => {
          targetEl.classList.remove("move-to-animation");
        }, 2000);
      }
    },
    /**
     * @param { Event } e
     */
    onScaleImage(e) {
      const target = e.target;
      const src = target.dataset.src;

      if (target.tagName === "IMG" && src) {
        this.create(Photo, { src, show: true });
      }
    },
    /**
     * 图片懒加载
     * @param { HTMLImageElement[] } lazyImges
     */
    lazyloadImg(lazyImges = []) {
      for (let i = 0; i < lazyImges.length; i++) {
        let img = lazyImges[i];

        if (this.isVisible(img)) {
          img.src = img.getAttribute("data-src");

          lazyImges.splice(i, 1);

          i--;
        }
      }
    },
    /**
     * @param { HTMLImageElement } element
     */
    isVisible(element) {
      let rect = element.getBoundingClientRect();
      // 用户不管是从上向下、从下向上、从左向右、从右向左滑动，都可以判断当前元素是否在可视区域
      return (
        rect.top < viewport.clientHeight &&
        rect.bottom > 0 &&
        rect.left < viewport.clientWidth &&
        rect.right > 0
      );
    },

    // ------------------------- 时间线相关 ----------------------------

    // 每个回复元素挂载时记录元素偏移信息
    // BUG：在展开引用回复时，offset 应该刷新
    collectVNodesOffset(index) {
      const { offsetTop } = this.replyVnodes[index].$el;

      this.replyTopOffsets.push(offsetTop);
    },
  },
};
</script>

<style lang="postcss">
.move-to-animation {
  animation: moveToTarget 2s linear;
}

/* move to target element  */
@keyframes moveToTarget {
  0% {
    background-color: #d1fae5;
  }
  100% {
    background-color: #fff;
  }
}

.reply-content {
  pre {
    @apply rounded-lg p-3 my-4 shadow-xl;

    div {
      padding: 10px 15px;
      border-radius: 5px;
      white-space: pre-line;
      font-size: 14px;
      margin: 10px 0px;
    }

    span {
      font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
        monospace;
      line-height: 1.6;
    }
  }

  a {
    @apply underline underline-offset-2 underline-green-300;
  }

  h1,
  h2,
  h3 {
    @apply py-3;
  }

  h1 {
    @apply text-3xl font-extralight;
  }

  h2 {
    @apply text-2xl font-extralight;
  }

  p {
    @apply py-3;
  }

  blockquote {
    @apply px-3 py-1 m-0 border-l-5 border-l-gray-300
  bg-gray-50 text-gray-600 my-3 rounded-sm;

    strong {
      color: #6a737d;
    }
  }

  ol,
  ul {
    @apply list-inside my-3;
  }

  ul {
    @apply list-disc;
  }

  img {
    @apply shadow-md rounded-[10px] cursor-pointer my-2;
  }
}
</style>
