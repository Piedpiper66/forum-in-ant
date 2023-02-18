<template>
  <page-loading :loading="!isLoaded">
    <!-- 加载完毕且有数据才显示 -->
    <div
      id="detail"
      v-if="contentVisibe"
      key="content"
      @click="onScaleImage"
      class="flex"
    >
      <!-- 主内容宽度 3/4 -->
      <div class="flex-[3]">
        <!-- 话题标题 -->
        <section class="flex flex-col flex-nowrap pt-5 mb-3 pb-5">
          <!-- 标题 -->
          <h1
            class="flex justify-between w-full text-2xl font-semibold font-sans mb-1 text-gray-700 space-x-3"
          >
            <span>{{ detail.title }}</span>
            <!-- <a-button
              type="primary"
              class="!flex items-center space-x-1.5"
              @click="onSubscribe"
            >
              <Icon name="plus" /><span class="text-base">关注</span>
            </a-button> -->
            <button
              v-if="isLogin"
              class="shadow-md px-2.5 py-1.5 rounded-md outline-none space-x-1 flex items-center transition-colors duration-300"
              :class="[
                detail.isSubscribe
                  ? 'bg-gray-300 hover:bg-gray-400'
                  : 'bg-green-400 hover:bg-green-500 text-white',
              ]"
              @click="subscribeThrottleFn"
            >
              <Icon :name="detail.isSubscribe ? 'correct' : 'plus'" />
              <span class="text-base">{{
                detail.isSubscribe ? "已关注" : "关注"
              }}</span>
            </button>
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

        <div id="detail-content" class="w-full" ref="detail">
          <div class="h-0 border-b-3 rounded-md"></div>
          <reply
            v-for="(reply, index) in themeReplies"
            :key="index"
            :reply="reply"
            ref="reply"
            :showResolve="shouldShowResolveIcon && !!index"
            @hook:mounted="collectVNodesOffset(index)"
            @moveToRef="handleReplyMove"
            @toggleSupport="onToggleSupport(reply)"
            @toggleBookmark="onToggleBookmark(reply)"
            @toggleResolved="onToggleResolve(reply)"
          >
            <!-- 以下为主题的统计信息, 即 index === 0 -->
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
      </div>

      <!-- 时间线 占据宽度 1/4, 在 lg 以下隐藏 -->
      <div
        id="timeline"
        class="hidden lg:flex flex-1 justify-center select-none ml-3"
      >
        <!-- 
              sticky 生效的注意事项
              1. 直系父元素不能overflow-x-x: hidden 或者overflow:auto属性
              2. 必须指定top、bottom、left、right4个值之一，否则只会处于相对定位
              3. 父元素的高度不能低于sticky元素的高度
           -->
        <div class="text-base" v-if="timeList && timeList.length > 0">
          <TimeLine :offsets="replyTopOffsets" :times="timeList" />
        </div>
      </div>
    </div>
    <!-- 无效 themeId -->
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
import Photo from "../components/universe/ImageViewer.vue";
import { mapGetters } from "vuex";

// 所有回复中的内容中存在的图片，用于懒加载
let lazyImges = [];

const viewport = document.documentElement;

// 用于保存头部的切换信息
let headerInfo = null;

let io = null;

let timer = null;

export default {
  name: "ThemeDetail",
  inject: ["appReload"],
  components: {
    Reply,
    TimeLine,
  },
  beforeRouteLeave(from, to, next) {
    const { _id } = this.detail;

    if (this.isLogin) {
      // 记录离开该主题的时间，用于关注的主题的最新回复
      this.socket.emit("updateThemeViewTime", {
        id: _id,
        user: this.userId,
        date: Date.now(),
      });

      this.socket.off("updateThemeViewTime");

      this.$bus.$emit("clearThemeLatest", _id);
      this.$bus.$off("clearThemeLatest");
    }

    next();
  },
  provide() {
    return {
      href: location.href,
      freshOffsets: this.recollectOffset.bind(this),
    };
  },
  data() {
    return {
      isLoaded: false,
      detail: null,
      // 所有 reply 距离页面顶部的偏移量
      replyTopOffsets: [],
      // 所有回复的创建时间组成的数据
      timeList: [],
      timer: null,
      // 在刚进入详情页时是否已经跳转到对应的 reply 位置
      hasComeInMove: false,
    };
  },
  computed: {
    ...mapGetters(["isLogin", "userId"]),
    contentVisibe() {
      return this.isLoaded && this.detail;
    },
    // 做一个获取 el 的缓存,
    // #BUG 不能缓存，否则元素不更新
    // replyVnodes() {
    //   return this.$refs.reply;
    // },
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
    // 是否显示解决方案的图标
    shouldShowResolveIcon() {
      // 已登录 + 该贴是登录用户创建 + 帖子未含有解决方案 + 帖子不是第一个
      // 主题层面，如果某个帖子为解决方案，则可以显示，其他的则不显示
      return (
        this.isLogin &&
        this.userId === this.detail.creatorId &&
        !this.detail.isResolve
      );
    },
    subscribeThrottleFn() {
      return this.throttle(this.onSubscribe, 500, true);
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

      if (rId && !this.hasComeInMove) {
        setTimeout(() => {
          this.handleReplyMove(rId);
        }, 500);
      }

      // 当 replyTopOffsets 更新完成，说明所有回复元素已渲染，开始监听图片的插入
      if (this.$refs.detail) {
        io.observe(this.$refs.detail, { childList: true, subtree: true });
      }
    },
  },
  async mounted() {
    let onPageScroll = this.throttle(this.toggleHeaderTitle, 100, true, this);
    //
    window.addEventListener("scroll", onPageScroll);
    this.$once("hook:destroyed", () => {
      window.removeEventListener("scroll", onPageScroll);
      onPageScroll = null;
    });

    // 收集懒加载图片
    lazyImges = [].slice.call(document.querySelectorAll("img[data-src]"));
    // 初始加载先尝试渲染一遍
    this.lazyloadImg(lazyImges);

    io = new IntersectionObserver((_) => {
      // 在图片被插入时重新收集 offsets
      this.recollectOffset();
    });

    // 在编辑器中点击回复，使得可以自动跳转
    this.$bus.$on("moveToRef", this.handleReplyMove);

    // 更改关注按钮的状态
    this.$bus.$on("toggleSubButton", this.toggleSubButton);
  },

  beforeDestroy() {
    // 清空头部信息
    this.busEmitFn(null);

    lazyImges = [];
    headerInfo = null;

    this.$bus.$off("toggleSubButton");
    this.$bus.$off("moveToRef");

    io = null;
  },
  methods: {
    async copeDetailFetch(themeId) {
      // prettier-ignore
      const theme = await this.$api.getTopicDetail(themeId, this.userId);

      if (!theme) {
        this.isLoaded = true;
        return false;
      }

      theme.isSubscribe = theme.isSubscribe ?? false;

      const replies = theme.replies;

      /**
       * 给 topic.replies 的头部添加一个由 topic 自身构成的 reply
       * 即整个 Topic 是由一个 reply 数组构成的
       */
      replies.unshift(this.generateReply(theme));

      /**
       * 如果已登录, 则通过每个回复的 id 查询用户是否点赞了该贴
       * 不将所有点赞 id 存储在本地是防止点赞量过大导致的数据加载过慢
       */
      let userSupports = [];
      let userBookmarks = [];
      if (this.isLogin) {
        const ids = replies.map(({ _id }) => _id);
        userSupports = await this.$api.getUserThemeLikes(ids);
        userBookmarks = await this.$api.getUserThemeBookmarks(ids);
      }

      console.log(userSupports);

      replies.forEach((reply, index) => {
        // 设置是否点赞
        reply.isSupport = !!userSupports[index];
        // 设置是否收藏
        reply.isBookmark = !!userBookmarks[index];
        // 给每个 reply 添加额外属性，以辅助业务逻辑
        this.setExtraProperty(theme, reply, index);
      });

      this.timeList = replies.map(({ createTime }) => createTime);

      this.detail = theme;

      document.title = "[Rao Forum]: " + theme.title;

      // 缓存头部信息
      headerInfo = this.getHeaderInfo();

      setTimeout(() => (this.isLoaded = true), 300);
    },
    // 将主题信息也设置为一个 reply 放置在顶端
    generateReply(topic) {
      return {
        supportLen: topic.supportLen,
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
    // 给每一个 reply 设置额外信息
    setExtraProperty(theme, reply, index) {
      const { isResolve, solution, creatorId } = theme;

      Object.assign(reply, {
        creatorId,
        // 是否是主题的作者
        isCreator: index == 0,
        // 当前 reply 的下标从 1 开始，以辅助时间线的运转
        posi: index + 1,
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
    // 控制头部标题的显隐
    toggleHeaderTitle() {
      const currTop = window.scrollY;
      const canDeliver = currTop > 60;

      this.busEmitFn(canDeliver ? headerInfo : null);

      clearTimeout(timer);
      // 防止滚动太快在 scrollY 的值大于 60 时，页面已经触顶
      timer = setTimeout(() => {
        if (currTop >= 60 && window.scrollY < 60) {
          this.busEmitFn(null);
        }
      }, 100);

      // 用于图片懒加载, 本来不应该出现在这，但也是 onscroll 事件，就索性放一起了
      lazyImges.length && this.lazyloadImg(lazyImges);
    },
    getHeaderInfo() {
      const { title, category, tags } = this.detail;

      // 根据当前的话题类目与标签添加额外信息
      const info = { title };

      // category => category copy
      if (category || category.length) {
        const { description, name, alias } = category[0];
        info.category = { description, name, alias };
      }

      // tag => tag copy
      if (tags) {
        info.tags = tags.map((i) => i);
      }

      return info;
    },
    // 用户订阅主题信息，当有新的回复时通知用户
    async onSubscribe() {
      if (!this.isLogin) {
        this.$message.info("请先登录~");
        return false;
      }

      const { _id: themeId, isSubscribe } = this.detail;
      // 取消 0， 关注 1
      const type = +!isSubscribe;

      const result = await this.$api.toggleSubscribe(themeId, type);

      if (result === "success") {
        if (type) {
          // 关注
          this.$message.success("已关注!");
          this.detail.isSubscribe = true;
        } else {
          // 取消关注
          this.$message.success("已取消关注!");
          this.detail.isSubscribe = false;
        }

        // 在头部的 User 模块的关注面板中增加或删除订阅
        this.$bus.$emit("toggleSubscribe", { type, detail: this.detail });
      } else {
        this.$message.error("操作失败");
      }
    },
    toggleSubButton() {
      this.detail.isSubscribe = !this.detail.isSubscribe;
    },

    // ------------------------- 回复组件相关 ---------------------------
    handleReplyMove(replyId) {
      const targetReplyIndex = this.themeReplies.findIndex(
        ({ _id }) => _id === replyId
      );

      // console.log(this.$refs);
      const currVNode = this.$refs.reply[targetReplyIndex];

      if (currVNode) {
        this.hasComeInMove = false;

        const targetEl = currVNode.$el;

        const targetOffset = this.replyTopOffsets[targetReplyIndex];

        targetEl.classList.add("move-to-animation");

        window.scrollTo({ top: targetOffset, behavior: "smooth" });

        setTimeout(() => {
          targetEl.classList.remove("move-to-animation");

          this.hasComeInMove = true;
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

        if (this.isImgVisible(img)) {
          img.src = img.getAttribute("data-src");

          lazyImges.splice(i, 1);

          // this.recollectOffset();

          i--;
        }
      }
    },
    /**
     * @param { HTMLImageElement } element
     */
    isImgVisible(element) {
      let rect = element.getBoundingClientRect();
      // 用户不管是从上向下、从下向上、从左向右、从右向左滑动，都可以判断当前元素是否在可视区域
      return (
        rect.top < viewport.clientHeight &&
        rect.bottom > 0 &&
        rect.left < viewport.clientWidth &&
        rect.right > 0
      );
    },
    // 切换对应 reply 的 isSupport 的值
    onToggleSupport(reply) {
      const currStatus = reply.isSupport;

      reply.isSupport = !currStatus;

      if (currStatus) reply.supportLen -= 1;
      else reply.supportLen += 1;
    },
    // 切换对应 reply 的 isBookmark 的值
    onToggleBookmark(reply) {
      reply.isBookmark = !reply.isBookmark;
    },
    // 切换对应 reply 的 isSolution 的值
    onToggleResolve(reply) {
      reply.isSolution = !reply.isSolution;
      this.detail.isResolve = !this.detail.isResolve;
    },
    busEmitFn(info) {
      this.$bus.$emit("titleEmerge", info);
    },

    // ------------------------- 时间线相关 ----------------------------

    // 每个回复元素挂载时记录元素偏移信息
    /**
     * @param { number } index $refs.reply 的序号
     * @param { boolean } nextTick 是否需要在 nextTick 之后获取
     */
    async collectVNodesOffset(index, nextTick = true) {
      // 不适用 nextTick 会导致 offsetTop 不准确
      if (nextTick) await this.$nextTick();

      const { offsetTop } = this.$refs.reply[index].$el;

      if (index === 5) {
        console.log(offsetTop);
      }

      this.replyTopOffsets.push(offsetTop);
    },
    //
    recollectOffset() {
      this.replyTopOffsets = [];

      const len = this.$refs.reply.length;

      for (let i = 0; i < len; i++) {
        this.collectVNodesOffset(i, false);
      }
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
</style>
