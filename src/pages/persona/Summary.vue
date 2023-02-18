<style lang="postcss" scoped>
.statistic-item:not(:last-of-type) {
  margin-right: 2.5rem;
}
</style>

<template>
  <page-loading :loading="!isLoaded">
    <div id="summary" class="space-y-10" v-if="isLoaded" key="summary">
      <!-- 数据统计 -->
      <section>
        <h1 class="text-xl font-bold text-gray-600 mb-0">统计</h1>
        <div class="flex flex-wrap text-gray-400">
          <template v-if="statistics">
            <span
              class="statistic-item align-middle whitespace-nowrap mt-6 space-x-1 flex items-center"
              v-for="(value, key, index) in statistics"
              :key="index"
            >
              <b
                v-if="!['recent_time_read', 'time_read'].includes(key)"
                v-number.toK="value"
                class="mr-0.5 text-gray-800 text-xl"
              ></b>
              <b
                v-else
                class="mr-0.5 text-gray-800 text-xl"
                v-number.duration="value"
              ></b>
              <Icon
                v-if="iconMap[key]"
                :name="
                  Array.isArray(iconMap[key]) ? iconMap[key][0] : iconMap[key]
                "
                class="leading-10"
                :class="[Array.isArray(iconMap[key]) ? iconMap[key][1] : '']"
              />
              <span class="text-base">{{ statisticsMap[key] }}</span>
            </span>
          </template>
          <span v-else class="mt-10">暂无记录</span>
        </div>
      </section>

      <!-- 活动统计 -->
      <div class="flex flex-wrap">
        <template v-if="activitiesData">
          <section
            v-for="(value, key, index) in activitiesData"
            :key="key"
            class="inline-block w-full sm:w-1/2 pr-5"
            :class="{ 'mt-10': index > 1 }"
          >
            <h1 class="text-xl font-bold text-gray-600 mb-0">
              {{ acticitiesMap[key] }}
            </h1>
            <ul v-if="value.length">
              <li
                v-for="(item, index) in value.slice(0, 6)"
                :key="index"
                class="border-l-3 my-3 pl-2 py-1 flex"
                :class="{
                  'flex-col': isTextLink(key),
                  'items-center space-x-3': !isTextLink(key),
                }"
              >
                <!-- 文字链接 -->
                <template v-if="isTextLink(key)">
                  <div class="text-gray-400 flex items-center">
                    <span v-date.CN="item.create_at"></span>
                    <span v-if="item.like_count > 0">
                      <Icon name="like-filled" class="text-red-400 mx-2" />
                      <span v-number.toK="item.like_count"></span>
                    </span>
                  </div>
                  <div class="text-sm font-medium">
                    <router-link
                      :to="{
                        name: 'theme',
                        params: { themeId: item.topic_id },
                        query: { rId: item._id },
                      }"
                      class="text-green-500"
                    >
                      <span>{{ item.title }}</span>
                    </router-link>
                  </div>
                </template>

                <!-- 包含头像 -->
                <template v-else>
                  <Avatar
                    :username="item.username"
                    :userId="item.userId"
                    :src="item.avatar"
                    :size="45"
                    class="mr-5"
                  />
                  <div>
                    <div>
                      <b class="mr-2 text-base text-gray-600">{{
                        item.username
                      }}</b>
                      <span class="text-gray-400">{{ item.fullname }}</span>
                    </div>
                    <div v-if="key === 'most_replies_to_users'">
                      <Icon name="reply" class="mr-2" />
                      <span>{{ item.count }}</span>
                    </div>
                    <div v-else-if="item.count">
                      <Icon name="like-filled" class="text-red-400 mr-2" />
                      <span v-number.toK="item.count"></span>
                    </div>
                  </div>
                </template>
              </li>
            </ul>
            <div v-else class="text-gray-400 text-base">暂无数据</div>
            <div
              v-if="key === 'topics' && totalTopics > 6"
              class="emphasis-text"
            >
              <!-- prettier-ignore -->
              <router-link :to="{ name: 'activity' }">更多{{ acticitiesMap[key] }}</router-link>
            </div>
            <div
              v-else-if="key === 'replies' && totalReplies > 6"
              class="emphasis-text"
            >
              <!-- prettier-ignore -->
              <router-link :to="{ name: 'activity' }">更多{{ acticitiesMap[key] }}</router-link>
            </div>
          </section>
        </template>
      </div>

      <!-- 类目统计 -->
      <section class="w-full sm:w-1/2 pb-6">
        <h1 class="text-xl font-bold text-gray-600 mb-0">热门分类</h1>
        <table v-if="categoriesData && categoriesData.length">
          <thead>
            <tr class="pb-2">
              <!-- 占位 -->
              <th class="pb-2"></th>
              <th class="pb-2 text-gray-400 font-light min-w-15">主题</th>
              <th class="pb-2 text-gray-400 font-light">回复</th>
            </tr>
          </thead>
          <tbody class="border-t-gray-200 border-t-3">
            <tr v-for="item in categoriesData" :key="item.alias">
              <td class="py-3 px-2 text-xs text-gray-600">
                <Type :name="item.name" />
              </td>
              <td class="py-3 px-3 text-sm text-green-500 text-center">
                <a href="#">
                  <span>{{ item.topic }}</span>
                </a>
              </td>
              <td class="p-3 text-sm text-green-500 text-center">
                <a href="https://www.baidu.com">
                  <span>{{ item.reply }}</span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-gray-400 text-base">暂无数据</div>
      </section>
    </div>
  </page-loading>
</template>

<script>
export default {
  name: "Summary",
  props: {
    excludeCache: Array,
  },
  data() {
    return {
      isLoaded: false,
      // 统计部份
      statistics: null,
      statisticsMap: Object.freeze({
        day_visited: "访问天数",
        time_read: "阅读时间",
        recent_time_read: "近期阅读时间",
        topics_entered: "已阅主题",
        likes_given: "送出",
        topic_count: "创建主题",
        post_count: "发表帖子",
        likes_receive: "收到",
        solved_count: "解决方案",
      }),
      iconMap: Object.freeze({
        likes_given: ["like-filled", "text-red-400"],
        likes_receive: ["like-filled", "text-red-400"],
        solved_count: "resolve",
      }),
      // 活动记录部分
      activitiesData: null,
      // 用于总的创建主题量，因为响应的数据只包含前6条
      totalTopics: 0,
      totalReplies: 0,
      acticitiesMap: Object.freeze({
        replies: "热门回复",
        topics: "热门主题",
        most_replies_to_users: "最多回复至",
        most_liked_by_user: "被谁赞得最多",
        most_liked_users: "赞谁最多",
      }),
      // 分类统计
      categoriesData: null,
    };
  },
  async created() {
    // 在登录用户更换了头像后, Summary 应该更新自身
    // 在显示之后, 继续维持 cachce 的保留, 因为页面已经刷新
    if (this.excludeCache.length > 0) {
      this.$emit("hasRefreshSelf");
    }

    const { username } = this.$route.params;

    const summary = await this.$api.getUserSummary(username);

    // 统计
    const truthyStatistics = Object.create(null);

    // prmiary 清楚假值
    Object.keys(this.statisticsMap).forEach((key) => {
      if (summary[key]) {
        truthyStatistics[key] = summary[key];
      }
    });

    this.statistics = Object.freeze(truthyStatistics);

    // 活动数据
    const activities = Object.create(null);

    Object.keys(this.acticitiesMap).forEach((key) => {
      activities[key] = summary[key];
    });

    this.activitiesData = activities;

    this.totalTopics = summary.topic_count;

    this.totalReplies = summary.post_count;

    // 主题分类数据
    this.categoriesData = summary.top_categories.filter(({ cateId }) => cateId);

    setTimeout(() => {
      this.isLoaded = true;
    }, 400);
  },
  methods: {
    isTextLink(type) {
      return ["replies", "topics"].includes(type);
    },
  },
};
</script>
