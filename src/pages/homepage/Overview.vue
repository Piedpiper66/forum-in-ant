<template>
  <!-- 概览 | 首页 -->
  <!-- 首页双列表 -->
  <transition name="slide-fade" mode="out-in">
    <a-row class="mt-4 flex-wrap" :gutter="20" v-if="isLoaded">
      <!-- 分类列 -->
      <a-col :span="11" class="dynamic-col">
        <div
          class="text-gray-400 w-full overflow-hidden mt-4 px-3 pb-4 border-b-3"
        >
          <span class="float-left">分类</span
          ><span class="float-right">主题数</span>
        </div>
        <div class="category-content">
          <router-link
            class="sort-card flex justify-between py-3 px-4 space-x-10 mt-4 border-b rounded-md shadow-sm cursor-pointer transition-all duration-350 transform hover:scale-103 hover:shadow-lg"
            :class="[getCategoryCardBg(item.alias)]"
            v-for="(item, index) in categoryOverview"
            :key="index"
            :to="{
              name: 'cateOnly',
              params: { category: item.alias, type: 'latest' },
            }"
          >
            <div class="flex flex-1 flex-col space-y-2">
              <h3
                class="text-xl font-bold tracking-wider"
                :class="[getCategoryNameColor(item.alias)]"
              >
                {{ item.name }}
              </h3>
              <span class="text-gray-500 text-sm font-thin tracking-wider">{{
                item.description
              }}</span>
            </div>
            <div class="w-15 text-gray-400 text-right">
              <span :title="'共有' + item.topicSum + '主题'">{{
                item.topicSum
              }}</span>
            </div>
          </router-link>
          <router-link to="/"></router-link>
          <router-link to="/"></router-link>
        </div>
        <a-empty
          description="暂无数据"
          v-show="!categoryOverview.length"
          :imageStyle="{ marginTop: '2rem', height: '15rem' }"
        />
      </a-col>

      <!-- 最新讯息列 -->
      <a-col :span="12" class="dynamic-col mb-10">
        <!-- 标题 -->
        <div class="text-gray-400 w-full mt-4 px-3 pb-4 border-b-3 mb-4">
          最新
        </div>
        <!-- 列表 -->
        <ul class="flex flex-col space-y-5">
          <li
            v-for="(item, index) in topicLatest"
            :key="index"
            class="flex items-center space-x-4 px-2"
          >
            <!-- 头像 -->
            <Avatar
              :size="40"
              :username="fixCreator(item, 'username')"
              :src="fixCreator(item, 'avatar')"
              :userId="fixCreator(item, 'userId')"
            />
            <!-- 文章标题 + 类别 -->
            <div class="max-w-3/5 flex-grow flex-shrink-0 space-y-1">
              <router-link :to="encodeURI(`/t/${item._id}`)">
                <!-- prettier-ignore -->
                <div
                  class="font-semibold text-gray-700 break-words text-base  truncate
                  hover:(scale-110 translate-x-4 text-shadow-sm) transform transition-transform duration-200
                  "
                  :title="item.title"
                >
                  {{ item.title }}
                </div>
              </router-link>
              <div class="space-x-2">
                <Type
                  v-if="item.category.length"
                  :name="item.category[0].name"
                />
                <Type v-for="tag in item.tags" :key="tag" :name="tag" />
              </div>
            </div>
            <!-- 信息 -->
            <div
              class="text-right text-gray-400 flex-grow flex-shrink-0 cursor-default"
            >
              <div
                class="font-semibold text-base"
                :title="'该主题共有' + item.replyCount + '个回复'"
              >
                {{ item.replyCount }}
              </div>
              <div
                class="lg:block xs:hidden"
                :title="
                  '最早发布于: ' +
                  timeParser(item.createDate) +
                  '\n' +
                  '最后评论于: ' +
                  timeParser(item.lastActivity)
                "
                v-date.CN.live.suffix="item.createDate"
              ></div>
            </div>
          </li>
        </ul>
        <!-- prettier-ignore -->
        <router-link 
          class="more-btn inline-block float-right mt-3 px-4 py-2 rounded-md shadow-sm 
                transition-colors duration-400 bg-gray-200 cursor-pointer font-semibold
                text-gray-700 hover:(bg-gray-400 text-white) tracking-widest" 
          to="/type/latest"
          v-show="topicLatest.length === this.maxLatestTopics"
        >更多</router-link>
        <a-empty
          description="暂无数据"
          v-show="!topicLatest.length"
          :imageStyle="{ marginTop: '2rem', height: '15rem' }"
        />
      </a-col>
    </a-row>
  </transition>
</template>

<script>
import { timeParser } from "../../utils/format";

export default {
  name: "Overveiw",
  inject: ["categoryColorTable"],
  data() {
    return {
      categoryOverview: [],
      topicLatest: [],
      isLoaded: false,
      maxLatestTopics: 20,
    };
  },
  computed: {
    timeParser: () => (time) => timeParser(time),
  },
  created() {
    this.getOverviewData();
  },
  methods: {
    async getOverviewData() {
      const [categories, topics] = await Promise.all([
        this.$api.getCategories(),
        this.$api.getLatestTopics({
          skip: 0,
          limit: this.maxLatestTopics,
        }),
      ]);
      this.$store.commit("SET_CATEGORY", categories || []);

      // 左侧类目总览
      this.categoryOverview = categories || [];

      // 右侧 20 条最新发表的文章

      // 用户信息项存在于数组中，将其打散置于顶层
      // prettier-ignore
      topics && topics.forEach((item) => {
        const info = item.creator[0];
        info && Object.assign(item, info);
        delete item.creator;
      });

      this.deepFreeze(topics);

      this.topicLatest = topics || [];

      setTimeout(() => {
        this.$emit("callForDisplay");
        this.isLoaded = true;
      }, 200);
    },
    fixCreator(info, prop) {
      const value = info[prop];
      return value ? value : prop === "username" ? "用户已注销" : "";
    },
    getCategoryNameColor(alias) {
      return this.categoryColorTable[alias];
    },
    getCategoryCardBg(alias) {
      return `${this.categoryColorTable[alias]}-bg`;
    },
  },
};
</script>

<style lang="postcss" scoped>
.dynamic-col {
  @apply w-full md:w-1/2;
}
</style>
