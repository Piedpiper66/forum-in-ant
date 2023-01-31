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
      <!-- 点赞收藏和回复列表 -->
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
                  v-if="!false"
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
                <span
                  v-else
                  class="text-green-400 font-medium text-sm cursor-default"
                  >{{ item.title }}</span
                >
                <div class="text-gray-400 flex items-center">
                  <i
                    v-if="arrowShow"
                    class="el-icon-arrow-down font-semibold cursor-pointer transition-transform duration-300"
                    :class="[arrowUp ? 'rotate-arrow' : '']"
                    @click="toggleContent"
                  ></i>
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
          <div
            v-if="false"
            class="w-full flex justify-between items-center mt-2"
          >
            <span
              class="bg-gray-300 cursor-pointer px-4 py-1 text-sm hover:(bg-gray-500 text-white)"
              @click="editDraft"
              >编辑</span
            >

            <el-popconfirm
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
            </el-popconfirm>
          </div>
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
      <a-empty
        description="暂无数据"
        key="empty"
        v-else
        :imageStyle="{ marginTop: '2rem', height: '15rem' }"
      />
    </transition>
  </el-skeleton>
</template>

<script>
import { timeParser } from "../../utils/format";

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
    };
  },
  computed: {
    username() {
      return this.$route.params.username;
    },
    contentSubstr() {},
  },
  watch: {
    "$route.params": {
      handler: async function ({ type, username }) {
        if (this.$route.name === "activityList") {
          this.isTheme = type === "theme";

          this.page = 1;

          this.pageSize = 10;

          await this.getCurrentList(username, type);
        }
      },
      immediate: true,
    },
  },
  created() {},
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
    getContentSubstr(content) {
      oDiv.innerHTML = content;

      const plainText = oDiv.innerText;

      return plainText.length > this.contentLimitedLen
        ? plainText.substr(0, this.contentLimitedLen) + " ..."
        : plainText;
    },
    toggleContent() {},
    editDraft() {},
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

<style lang="postcss" scoped>
.avatar-box > span:not(:first-of-type) {
  @media only screen and (max-width: 832px) {
    display: none !important;
  }
}

.sort-view > thead th {
  @apply text-gray-400 font-normal align-middle;
}
</style>
