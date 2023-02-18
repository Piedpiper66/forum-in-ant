<template>
  <el-skeleton :loading="!isLoaded" animated>
    <template slot="template">
      <div class="flex flex-col">
        <div class="flex">
          <el-skeleton-item
            variant="image"
            style="width: 55px; height: 55px; border-radius: 50%"
          >
          </el-skeleton-item>
          <div class="w-full flex flex-col flex-1">
            <el-skeleton-item
              variant="text"
              style="width: 40%; margin: 0 0 0.75rem 0.75rem; height: 1.05rem"
            ></el-skeleton-item>
            <el-skeleton-item
              variant="text"
              style="
                width: 60%;
                margin: 0.75rem 0 0.75rem 0.75rem;
                height: 1.05rem;
              "
            ></el-skeleton-item>
          </div>
        </div>
        <div class="mt-4">
          <el-skeleton-item
            variant="text"
            style="height: 1.05rem"
          ></el-skeleton-item>
          <el-skeleton-item
            variant="text"
            style="margin-top: 0.75rem; height: 1.05rem"
          ></el-skeleton-item>
          <el-skeleton-item
            variant="text"
            style="margin-top: 0.75rem; height: 1.05rem"
          ></el-skeleton-item>
        </div>
      </div>
    </template>

    <transition name="slide-fade" mode="out-in" class="activity">
      <!-- 全部、点赞、收藏、回复列表 -->
      <div
        key="content"
        v-if="
          !isTheme && isLoaded && listData && listData.length && !errorInvoke
        "
      >
        <div
          class="display-card border-b-1 py-4 px-2 w-full"
          v-for="item in listData"
          :key="item._id"
        >
          <div class="userinfo flex">
            <Avatar
              :username="item.username"
              :src="item.avatar"
              :userId="item.userId"
              :size="45"
            />
            <div class="ml-3 flex flex-col flex-1">
              <div class="flex justify-between items-center">
                <router-link
                  :to="{
                    name: 'theme',
                    params: { themeId: item.topicId },
                    query: {
                      rId: $route.params.type === 'reply' ? item._id : void 0,
                    },
                  }"
                  class="text-green-400 font-medium text-sm"
                  >{{ item.title }}</router-link
                >
                <div class="text-gray-400 flex items-center">
                  <span
                    class="text-xs ml-2"
                    v-date.CN="item.createDate || item.lastModified"
                  ></span>
                </div>
              </div>
              <div class="space-x-2" v-if="item.category && item.category.name">
                <Type
                  :name="item.category.name"
                  class="text-gray-600 text-xs"
                />
              </div>
            </div>
          </div>
          <div class="detail mt-3">
            <p class="text-sm" v-if="!false">
              {{ getContentSubstr(item.content) }}
            </p>
            <p v-else class="text-sm" v-html="item.markdown"></p>
          </div>
          <!-- <div
            v-if="false"
            class="w-full flex justify-between items-center mt-2"
          >
            <span
              class="bg-gray-300 cursor-pointer px-4 py-1 text-sm hover:(bg-gray-500 text-white)"
              @click="editDraft"
              >编辑</span
            >
            <a-popconfirm
              confirm-button-text="确定"
              cancel-button-text="不用了"
              icon="el-icon-info"
              icon-color="red"
              title="确定删除？"
              @confirm="clearDraft"
            >
              <span
                class="bg-red-500 px-3 py-1 cursor-pointer text-white hover:bg-red-600"
                slot="reference"
                ><i class="el-icon-delete font-semibold"></i
              ></span>
            </a-popconfirm>
          </div> -->
        </div>
      </div>
      <!-- 创建的主题列表 -->
      <table
        v-else-if="
          isTheme && isLoaded && tableData && tableData.length && !errorInvoke
        "
        class="sort-view w-full text-gray-500"
        key="table"
      >
        <thead>
          <tr class="border-b-3 cursor-default">
            <th class="py-3 px-1 text-left">主题</th>
            <th class="w-13 md:w-16">回复</th>
            <th class="hidden-xs-only w-16">浏览</th>
            <th class="whitespace-nowrap">活动</th>
          </tr>
        </thead>
        <tbody class="w-full">
          <tr
            v-for="(item, index) in tableData"
            :key="index"
            class="border-b-2"
          >
            <td>
              <router-link
                :to="{ name: 'theme', params: { themeId: item._id } }"
              >
                <span>
                  <Icon
                    v-show="item.isResolve"
                    name="resolve"
                    title="此主题已有解决方案"
                  />
                  <span class="text-gray-800">{{ item.title }}</span>
                  <!-- 是否是近期主题还需再改动 -->
                  <span
                    v-show="isLatestTopic(item.createDate)"
                    class="latest-dot"
                    title="近期主题"
                  ></span>
                </span>
              </router-link>
              <section class="space-x-2">
                <Type :name="item.category.name" />
                <Type v-for="tag in item.tags" :key="tag" :name="tag" />
              </section>
            </td>
            <!-- 回复量 -->
            <td>
              <span v-number.toK="item.replyCount || item.replyLen"></span>
            </td>

            <!-- 访问量 -->
            <td class="hidden-xs-only w-16">
              <span v-number.toK="item.viewCount"></span>
            </td>

            <!-- 上一次的活动时间 -->
            <td>
              <span
                class="whitespace-nowrap text-center"
                :title="getActivityTitle(item)"
                v-date.live.suffix="item.lastActivity"
              ></span>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-else-if="isDraft && userDraft"
        class="pr-6 relative top-2"
        ref="draft"
      >
        <div
          class="font-bold pb-1 mb-1 overflow-hidden flex items-center relative"
        >
          <span class="text-lg text-gray-400">类型:</span>
          <span class="ml-2 text-xl text-gray-600">{{
            draftKeyMap[userDraft.sort]
          }}</span>
          <span
            v-date.live.suffix.CN="userDraft.date || userDraft.lastModified"
            class="float-right text-gray-600 absolute right-0"
          ></span>
        </div>
        <!-- 如果是主题中的回复，加上链接，否则正常显示 -->
        <div class="p-2 pl-0 font-bold flex items-center">
          <span class="text-lg text-gray-400">
            <span v-if="isReply">该主题的</span>标题:
          </span>
          <router-link
            class="ml-2 text-xl text-gray-600 truncate"
            v-if="isReply"
            :to="generateDraftTo(userDraft)"
          >
            {{ userDraft.title }}
          </router-link>
          <span v-else class="ml-2 text-xl text-gray-600 truncate">{{
            userDraft.title
          }}</span>
        </div>
        <div
          v-if="userDraft.sort === 'private'"
          class="p-2 pl-0 font-bold flex items-center space-x-2"
        >
          <span class="text-lg text-gray-400">发送给用户 :</span>
          <div class="space-x-2">
            <span
              v-for="user in userDraft.to"
              :key="user.key"
              class="text-gray-600 text-base"
            >
              {{ user.label }}
            </span>
          </div>
        </div>
        <!-- 主题：标签 -->
        <div
          v-else-if="userDraft.sort === 'theme'"
          class="p-2 pl-0 font-bold flex items-center space-x-2"
        >
          <span class="text-lg text-gray-400">标签:</span>
          <Type
            v-if="userDraft.categoryId"
            :name="getCateIdName(userDraft.categoryId)"
          />
          <Type v-for="tag in userDraft.tags" :key="tag" :name="tag" />
        </div>
        <!-- 回复用户： -->
        <div
          v-else-if="userDraft.sort === 'replyToUser'"
          class="p-2 pl-0 font-bold flex items-center space-x-2"
        >
          <span class="text-lg text-gray-400">回复用户: </span>
          <Avatar
            :username="userDraft.to.username"
            :userId="userDraft.to.userId"
            :src="userDraft.to.avatar"
          />
          <span class="text-lg text-gray-600">{{ userDraft.to.username }}</span>
        </div>
        <!-- 通用内容 -->
        <div class="p-2 pl-0 font-bold">
          <p class="font-bold text-lg text-gray-400">内容:</p>
          <!-- 内容 -->
          <section
            v-if="userDraft.markdown"
            v-html="userDraft.markdown"
            class="my-3 pl-4 md-content"
            ref="content"
          ></section>
          <section v-else class="italic text-gray-400 text-base">
            （ 暂无内容 ）
          </section>
        </div>
        <!-- 控件 transition-all duration-200-->
        <div
          class="relative flex justify-end items-center space-x-3 py-2 bg-white box-content"
          ref="control"
        >
          <span
            class="bg-gray-300 cursor-pointer rounded-sm px-4 py-1.5 text-sm hover:(bg-gray-500 text-white)"
            @click="editDraft"
            ref="firstControl"
          >
            编辑
          </span>
          <a-button type="danger" @click="showDraftWarn = true">清空</a-button>
        </div>
        <div ref="slot" v-show="scrollSlotVisible"></div>
      </div>
      <a-empty
        description="暂无数据"
        key="empty"
        v-else
        :imageStyle="{ marginTop: '2rem', height: '15rem' }"
      />
    </transition>
    <!-- 删除草稿的 Modal 提示 -->
    <a-modal
      v-model="showDraftWarn"
      :zIndex="2499"
      :maskClosable="false"
      :dialogStyle="{
        top: '30vh',
        minWidth: '430px',
      }"
      okText="确定"
      cancelText="再想想"
      :confirmLoading="isRemovingDraft"
      @ok="onRemoveDraft"
    >
      <div slot="title" class="flex items-center space-x-2">
        <Icon name="errorTip" class="text-red-400" />
        <span class="text-gray-500 font-bold">确认</span>
      </div>
      <div class="text-gray-600 font-bold text-xl text-center tracking-wider">
        确认要清除吗?
      </div>
    </a-modal>
  </el-skeleton>
</template>

<script>
import { timeParser } from "../../utils/format";
import { mapGetters } from "vuex";
import editorMixin from "../editor/mixin";

const oDiv = document.createElement("div");

export default {
  name: "ActivityList",
  data() {
    return {
      isTheme: false,
      isLoaded: false,
      listData: null,
      tableData: null,
      errorInvoke: false,
      page: 1,
      pageSize: 10,
      contentLimitedLen: 100,
      arrowShow: false,
      arrowUp: false,
      isDraft: false,
      showDraftWarn: false,
      isRemovingDraft: false,
      // 屏幕滚动时，用于当作 refs.control 的 slot
      scrollSlotVisible: false,
      scrollInfo: {},
      leftFlag: 0,
    };
  },
  computed: {
    username() {
      return this.$route.params.username;
    },
    ...mapGetters(["userDraft", "userInfo", "editorShow", "categories"]),
    draftKeyMap() {
      const configData = editorMixin.data();
      return Object.keys(configData).reduce((pre, configKey) => {
        const { type, title } = configData[configKey];
        pre[type] = title;
        return pre;
      }, {});
    },
    isReply() {
      return ["replyToTheme", "replyToUser"].includes(this.userDraft.sort);
    },
    contentSubstr() {},
  },
  watch: {
    "$route.params": {
      handler: async function ({ type, username }) {
        if (this.$route.name === "activityList") {
          // draft 类型需要单独处理
          this.isDraft = type === "draft";

          this.isTheme = type === "theme";

          this.page = 1;
          this.pageSize = 10;
          this.isLoaded = false;
          this.listData = null;
          this.tableData = null;

          if (!this.isDraft) {
            await this.getCurrentList(username, type);

            window.removeEventListener("scroll", this.controlsThrottleFn);
          } else {
            // await this.$nextTick();
            this.handleUserDraft();
            // setTimeout(() => {
            //   const controlRef = this.$refs.control;
            //   this.scrollInfo = Object.freeze({
            //     htmlEl: document.documentElement,
            //     windowH: window.innerHeight,
            //     controlRef,
            //     contentRef: this.$refs.content,
            //     draftRef: this.$refs.draft,
            //     topDistance: getElementToPageTop(this.$refs.content),
            //   });
            //   this.controlsThrottleFn();
            //   console.log(123);
            //   window.addEventListener("scroll", this.controlsThrottleFn);
            // });
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    async getCurrentList(username, type) {
      this.isLoaded = false;

      this.listData = null;

      this.tableData = null;

      this.errorInvoke = false;

      const requestParams = {
        username,
        type: type === "theme" ? "topic" : type,
        page: this.page,
        pageSize: this.pageSize,
      };

      // prettier-ignore
      const requestMethod = type !== "bookmark" ? "Activity" : "BookmarkList";

      const data = await this.$api[`get${requestMethod}`](requestParams);

      if (data) {
        const objectName = this.isTheme ? "tableData" : "listData";

        setTimeout(async () => {
          this.isLoaded = true;

          await this.$nextTick();

          this[objectName] = Object.freeze(data);
        }, 400);
      } else {
        this.errorInvoke = true;
      }
    },
    handleUserDraft() {
      if (this.userDraft) {
      }

      this.isLoaded = true;
    },
    handleControlScroll(windowH, htmlEl, controlClass) {
      this.controlsThrottleFn.call(this, windowH, htmlEl, controlClass);
    },
    getCateIdName(id) {
      return this.categories.find(({ _id }) => _id === id)?.name;
    },
    generateDraftTo(draft) {
      return {
        name: "theme",
        params: { themeId: draft.themeId || draft.extra.themeId },
        query: {
          rId: draft.sort === "replyToUser" ? draft.extra._id : void 0,
        },
      };
    },
    async onRemoveDraft() {
      this.isRemovingDraft = true;

      // 因此此时 editor不可见，不会触发组件自身的 $api.removeDraft()
      await this.$api.removeDraft();

      this.$store.commit("SET_USERDRAFT", null);

      setTimeout(() => {
        this.$bus.$emit("set_editor_empty");

        this.isRemovingDraft = false;

        this.$message.success("已删除");

        this.showDraftWarn = false;
      }, 300);
    },
    controlsThrottleFn() {
      this.throttle(this.setControlFixed, 500, true)();
    },
    setControlFixed() {
      const { windowH, controlRef, contentRef, topDistance, draftRef } =
        this.scrollInfo;

      requestAnimationFrame(() => {
        if (window.scrollY + windowH > topDistance + contentRef.clientHeight) {
          controlRef.classList.remove("scroll-to-fixed");
          controlRef.style.left = 0;
          this.scrollSlotVisible = false;
          // controlRef.style.left = x + "px";
        } else {
          controlRef.classList.add("scroll-to-fixed");
          const { width } = getComputedStyle(draftRef, false);
          const { x } = controlRef.getBoundingClientRect();
          this.leftFlag = x > 0 ? x : this.leftFlag;
          controlRef.style.left = this.leftFlag + "px";
          controlRef.style.width = width;
          this.scrollSlotVisible = true;
        }
      });
    },
    getContentSubstr(content) {
      oDiv.innerHTML = content;

      const plainText = oDiv.innerText;

      return plainText.length > this.contentLimitedLen
        ? plainText.substr(0, this.contentLimitedLen) + " ..."
        : plainText;
    },
    toggleContent() {},
    editDraft() {
      this.$store.commit("SET_EDITORSHOW", !this.editorShow);
    },
    clearDraft() {},
    isLatestTopic(date) {
      return +new Date() - date <= 7 * 24 * 60 * 60 * 1000;
    },
    getActivityTitle({ createDate, lastActivity }) {
      const format = "yyyy年MM月dd日 hh:mm:ss";
      return `创建时间: ${timeParser(
        createDate,
        format
      )}\n上次回复时间: ${timeParser(lastActivity, format)}`;
    },
  },
};
</script>

<style lang="postcss">
.avatar-box > span:not(:first-of-type) {
  @media only screen and (max-width: 832px) {
    display: none !important;
  }
}

.sort-view > thead th {
  @apply text-gray-400 font-normal align-middle;
}

.draft-pop {
  .ant-popover {
    z-index: 2203 !important;
  }
  .ant-popover-inner-content {
    padding: 0.5rem;
  }
}

.scroll-to-fixed {
  position: fixed;
  bottom: 0;
  /* left: var(--rect-left); */
}
</style>
