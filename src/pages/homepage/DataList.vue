<template>
  <!-- 最新 | 近期 | 热门 -->
  <transition name="slide-fade" mode="out-in">
    <div class="table w-full mb-5" v-if="isLoaded">
      <table class="mt-5 w-full text-gray-500 sort-view">
        <thead>
          <tr class="border-b-3">
            <th class="py-3 px-1 text-left cursor-default">主题</th>
            <th class="w-8 md:w-40 avatar"></th>
            <th class="w-13 md:w-16 whitespace-nowrap">回复</th>
            <th class="hidden-xs-only w-16 whitespace-nowrap">浏览</th>
            <th class="whitespace-nowrap">活动</th>
          </tr>
        </thead>
        <tbody class="w-full">
          <template v-if="tableData.length > 0">
            <tr
              v-for="(item, index) in tableData"
              :key="index"
              class="border-b"
            >
              <!-- 文章基本信息 -->
              <td>
                <router-link
                  :to="{ name: 'theme', params: { themeId: item._id } }"
                >
                  <section>
                    <!-- prettier-ignore -->
                    <span
                      class="inline-block text-gray-700 font-bold text-base transform 
                      hover:(scale-110 text-shadow-md) transition-transform duration-200"
                    >
                      <Icon
                        v-show="item.isResolve"
                        name="resolve"
                        title="此主题已有解决方案"
                        class="mr-1"
                      />

                      <span>{{ item.title }}</span>

                      <span
                        v-show="isLatestTopic(item.createDate)"
                        class="latest-dot"
                        title="近期主题"
                      ></span>
                    </span>
                    <!-- 是否是近期主题还需再改动 -->
                  </section>
                </router-link>
                <section class="space-x-2">
                  <Type
                    v-for="(cate, index) in item.category"
                    :key="index"
                    :name="cate.name"
                  />
                  <Type v-for="tag in item.tags" :key="tag" :name="tag" />
                </section>
              </td>

              <!-- 文章评论用户 -->
              <td
                class="avatar-box h-7 align-middle whitespace-nowrap space-x-1"
                v-if="avatar"
              >
                <Avatar
                  v-for="(user, index) in item.replies.slice(0, 4)"
                  :key="index"
                  :username="user.username"
                  :userId="user.userId || user.reply_user"
                  :src="user.avatar"
                  :extra-title="
                    !index
                      ? ' - 原始作者'
                      : item.resolver === user.reply_user
                      ? ' - 解决方案提供者'
                      : ''
                  "
                  class="w-1/5"
                  :class="[
                    index == 0 ? 'inline-block' : 'hidden md:inline-block',
                  ]"
                  :noSize="true"
                />
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
          </template>
          <template v-else></template>
          <!-- <div
            v-show="!isLoaded && tableData.length === 0"
            class="w-full text-center text-gray-400 py-3 relative left-1/2"
          >
            暂无更多数据
          </div> -->
        </tbody>
      </table>
      <a-empty
        description="暂无数据"
        v-show="isSearched && !tableData.length"
        :imageStyle="{ marginTop: '2rem', height: '15rem' }"
      />

      <transition-group name="fadeInOut" mode="out-in">
        <DataLoading
          v-show="isFetching"
          :show="isFetching"
          key="loading"
          class="mt-3"
        />

        <a-divider
          v-show="tableData.length > 0 && noMoreData"
          class="!px-10 !mt-10"
          key="noMore"
        >
          <span class="text-gray-400 text-sm">没有更多了哦~</span>
        </a-divider>
      </transition-group>
    </div>
  </transition>
</template>

<script>
import { timeParser } from "../../utils/format";
import Scroll from "../../mixins/scroll";

export default {
  name: "DataList",
  inject: ["homeReload"],
  mixins: [Scroll],
  props: {
    avatar: {
      type: Boolean,
      default: true,
    },
    sort: {
      type: Boolean,
      default: true,
    },
    isLoad: Boolean,
  },
  data() {
    return {
      tableData: [],
      isLoaded: false,
      page: 1,
      pageSize: 15,
      errorInvoke: false,
      isSearched: false,
      isShowEmpty: false,
      query: null,
    };
  },
  computed: {
    categoryList() {
      return this.$store.getters.categories;
    },
  },
  watch: {
    $route: {
      handler() {
        this.homeReload();

        this.$options.getList = async () => {
          await this.fetchTableData();
        };
      },
      immediate: false,
    },
  },
  created() {
    this.showUp();
  },
  async mounted() {
    this.$options.getList = async () => {
      await this.fetchTableData();
    };

    this.query = this.generateQuery(this.categoryList);

    await this.fetchTableData();
  },
  methods: {
    async fetchTableData() {
      try {
        this.errorInvoke = false;

        const topics = await this.$api.getLatestTopics(
          Object.assign(this.query, {
            limit: this.pageSize,
            skip: (this.page++ - 1) * this.pageSize,
          })
        );

        this.isSearched = true;

        if (topics && topics.length > 0) {
          topics.forEach((item) => {
            item.replies.unshift(item.creator[0] || {});
          });

          // this.page++;

          this.tableData = this.tableData.concat(topics);

          return Object.freeze(topics);
        } else {
          // this.errorInvoke = true;
          this.isShowEmpty = true;

          this.noMoreData = true;
          return [];
        }
      } catch (error) {
        this.errorInvoke = true;
        console.error("DataList.vue", error);
        return [];
      } finally {
        this.showUp();
      }
    },
    getCategoryIdByAlias(list = [], cateogry = "") {
      return list.find(({ alias }) => cateogry === alias)?._id;
    },
    generateQuery(cateList) {
      /**
       * limit, skip, categoryId, tag, type
       */
      const { category, tagname, type } = this.$route.params;

      const query = {};

      category &&
        (query["categoryId"] = this.getCategoryIdByAlias(cateList, category));

      tagname && (query["tag"] = tagname);

      type && (query["type"] = type);

      return query;
    },
    showUp() {
      setTimeout(() => {
        this.$emit("callForDisplay");
        this.isLoaded = true;
      }, 400);
    },
    // sortByReply() {
    //   if (!this.sort) return;
    // },
    // sortByBrowse() {
    //   if (!this.sort) return;
    // },
    // sortByActivity() {
    //   if (!this.sort) return;
    // },
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
.sort-view > thead th {
  @apply text-gray-400 font-normal align-middle;
}

.avatar-box > span:not(:first-of-type) {
  @media only screen and (max-width: 832px) {
    display: none !important;
  }
}

.table >>> .ant-empty-description {
  @apply font-bold text-xl text-gray-500 tracking-wider;
}
</style>
