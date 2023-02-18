<style lang="postcss" scoped>
.empty-private >>> .ant-empty-description {
  display: none;
}
</style>

<template>
  <page-loading :loading="isLoading">
    <div
      v-if="isRequested && detail"
      key="privatemsg"
      class="w-4/5 pt-10 mx-auto space-y-w-5"
    >
      <div class="flex items-center justify-between">
        <div
          class="flex items-center space-x-4 font-bold text-gray-600 text-xl"
        >
          <span class="text-gray-400" v-if="isReceive">来自: </span>
          <span class="text-gray-400" v-else>发送给: </span>
          <span class="space-x-2">
            <Avatar
              :username="currentUser.username"
              :src="currentUser.avatar"
              :userId="currentUser.userId"
              :size="50"
            />
            <span class="">{{ currentUser.username }}</span>
          </span>
        </div>
        <div
          v-date.CN.live.suffix="detail.createDate"
          class="text-lg text-gray-400 font-bold"
        ></div>
      </div>
      <div class="flex items-center space-x-4 font-bold text-gray-600 text-xl">
        <span class="text-gray-400">标题: </span>
        <span class="text-gray-600">{{ detail.title }}</span>
      </div>
      <div class="space-y-4">
        <h1 class="font-bold text-gray-400 text-xl">内容:</h1>
        <p
          class="text-gray-600 pl-4"
          v-html="detail.markdown || detail.content"
        >
          {{ detail.title }}
        </p>
      </div>

      <!-- 控制 -->
      <div class="flex items-center justify-end text-right space-x-4 mt-4">
        <a-button @click="onReply">回复</a-button>
        <a-button type="danger" @click="onRemove" :loading="isRemoving"
          >删除</a-button
        >
      </div>
    </div>
    <div v-else-if="isRemoved" key="empty" class="empty-private">
      <h1 class="flex items-center space-x-3 justify-end">
        <router-link
          :to="{
            name: 'messageList',
            params: { type: 'receive', username },
          }"
          class="text-xl font-bold text-gray-600"
        >
          前往私信列表
        </router-link>
        <Icon
          name="arrow-up"
          size="1.8rem"
          class="transform rotate-90 text-gray-400"
        />
      </h1>
      <a-empty
        description="暂无数据"
        key="empty"
        :imageStyle="{
          marginTop: '5rem',
          height: '15rem',
          transform: 'scale(1.8)',
        }"
      />
      <p
        class="text-center font-bold text-2xl text-gray-500 mt-10 tracking-wider"
      >
        暂无数据
      </p>
    </div>
  </page-loading>
</template>

<script>
export default {
  name: "PrivateMsg",
  data() {
    return {
      detail: null,
      isLoading: true,
      isRequested: false,
      isRemoving: false,
      isRemoved: false,
    };
  },
  computed: {
    isReceive() {
      return this.$route.params.type === "receive";
    },
    isSend() {
      return this.$route.params.type === "send";
    },
    currentUser() {
      return this.isReceive ? this.detail?.from_user : this.detail?.to_user;
    },
    username() {
      return this.$store.getters.username;
    },
  },
  watch: {
    $route: {
      handler: async function (to, from) {
        const { id } = to.query;

        this.isLoading = true;

        const messageDetail = await this.$api.getPrivateDetail(id);

        setTimeout(() => {
          this.detail = messageDetail;

          this.isLoading = false;

          this.isRequested = true;
        }, 300);
        console.log(messageDetail);
      },
      immediate: true,
    },
  },
  methods: {
    onReply() {
      this.$store.dispatch("setEditorStatus", {
        type: "private",
        info: {
          to: [
            {
              key: this.currentUser.userId,
              label: this.currentUser.username,
            },
          ],
          // title: "",
          // content: "",
          // markdown: "",
          // contentImgReflect: {},
        },
      });
    },
    async onRemove() {
      this.isRemoving = true;

      const data = await this.$api.removePrivate(
        this.detail.id,
        this.currentUser.userId
      );
      // const data = true;

      setTimeout(() => {
        if (data) {
          this.$message.success("已删除");

          this.isRemoved = true;

          this.detail = null;
        } else {
          this.$message.error("删除失败，请稍后重试");
        }

        this.isRemoving = false;
      }, 200);
    },
  },
};
</script>
