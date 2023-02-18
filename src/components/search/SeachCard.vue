<template>
  <div class="search-card flex space-x-3">
    <div>
      <Avatar
        :src="info.userInfo?.avatar"
        :userId="info.userInfo?.userId"
        :username="info.userInfo?.username"
        :size="40"
      />
    </div>
    <div class="flex flex-col space-y-2 w-full">
      <!-- prettier-ignore -->
      <router-link 
        :to="{
          name: 'theme',
          params: { themeId: info.topicId },
          query: { rId: info.replyId }
        }"
        class="flex items-center justify-between pr-3 overflow-auto space-x-3"
      >
        <h1 
          class="text-green-400 text-lg tracking-wide inline-block" 
          v-hightlight:[currQuery].title="info.title"
        ></h1>
        <div class="inline-block whitespace-nowrap">
          <span>{{ orderValue[0] }}</span>
          <span v-if="isDate(order)" v-date.live.CN.suffix="orderValue[1]"></span>
          <span v-else>{{ orderValue[1] }}</span>
        </div>
      </router-link>
      <div class="space-x-2">
        <Type :name="info.categoryName"></Type>
        <Type v-for="item in info.tags" :key="item" :name="item"></Type>
      </div>
      <p
        class="text-gray-500"
        v-hightlight:[currQuery].content="info.content"
      ></p>
    </div>
  </div>
</template>

<script>
export default {
  name: "SeachCard",
  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    currQuery: {
      type: String,
      default: "",
    },
    order: String,
  },
  computed: {
    orderValue() {
      switch (this.order) {
        case "support":
          return ["点赞数: ", this.info.likes];
        case "view":
          return ["浏览量: ", this.info.views];
        default:
          return ["", this.info.createDate || this.info.createTime];
      }
    },
  },
  methods: {
    isDate(order) {
      return !["support", "view"].includes(order);
    },
  },
};
</script>
