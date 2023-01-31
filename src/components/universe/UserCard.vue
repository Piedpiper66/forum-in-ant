<template>
  <el-skeleton class="xs:(w-30) w-full" animated :loading="!isLoaded">
    <template slot="template">
      <div class="px-5 py-3 pt-6">
        <div class="flex space-x-6">
          <el-skeleton-item
            variant="image"
            style="
              width: 120px;
              height: 120px;
              margin-top: -70px;
              border-radius: 50%;
            "
          />
          <div class="flex flex-col space-y-3">
            <el-skeleton-item
              variant="p"
              style="height: 20px; width: 250px; margin-top: -5px"
            />
            <el-skeleton-item variant="p" style="height: 10px; width: 100px" />
          </div>
        </div>
        <div class="mt-5 space-y-2">
          <el-skeleton-item v-for="item in 3" :key="item" variant="p" />
        </div>
      </div>
    </template>
    <!--  -->
    <template slot="default" v-if="userInfo">
      <div
        class="skeleton-bg rounded-sm w-full h-full rounded-[10px]"
        :class="{ 'text-shadow-sm': userInfo.cardBg }"
        :style="{
          background: [
            userInfo.cardBg ? `url(${userInfo.cardBg}) 0 0/cover` : '',
          ],
        }"
      >
        <!-- blur bg -->
        <div
          class="bg-white bg-opacity-60 bg-cover w-full h-full p-5 rounded-[10px]"
        >
          <!-- layout -->
          <div class="space-y-2 box-content w-full cursor-default">
            <div class="flex">
              <div class="hover:scale-110 transi-300">
                <router-link :to="userProfileLink">
                  <img
                    class="w-30 h-30 rounded-1/2 -mt-15 shadow-lg"
                    :src="userInfo.avatar"
                  />
                </router-link>
              </div>
              <div class="pl-6 flex-auto">
                <!-- 用户名 -->
                <router-link :to="userProfileLink">
                  <span
                    class="inline-block text-3xl font-extrabold text-black truncate text-yuanrun transi-300 hover:scale-110"
                  >
                    {{ userInfo.username }}
                  </span>
                </router-link>
                <!-- 真实名 -->
                <span class="block">{{ userInfo.fullname }}</span>
              </div>
              <!-- <Controls :userInfo="userInfo" /> -->
            </div>

            <!-- 个人介绍 -->
            <div class="text-gray-600 font-medium" title="个性签名">
              <span v-html="userInfo.introduction"></span>
            </div>

            <!-- 个人所在地 -->
            <div
              class="text-gray-600 flex items-center text-lg"
              v-show="userInfo.location"
            >
              <i class="el-icon-location mr-1"></i>
              <span class="font-semibold">{{ userInfo.location }}</span>
            </div>

            <div class="text-gray-500 space-x-3">
              <span class="space-x-2 pr-3 border-r border-r-gray-400">
                <span class="text-gray-800">最后发帖</span>
                <span
                  v-if="userInfo.lastPostDate"
                  class="keys"
                  v-date.live.suffix="userInfo.lastPostDate"
                ></span>
                <span v-else class="text-gray-800">&nbsp;暂无发帖</span>
              </span>
              <span class="space-x-2 pr-3 border-r border-r-gray-400">
                <span class="text-gray-800">加入于</span>
                <span
                  class="keys"
                  v-date.live.suffix="userInfo.createDate"
                ></span>
              </span>
              <span class="space-x-2">
                <span class="text-gray-800">阅读约</span>
                <span class="keys">{{
                  userInfo.readTime | formateReadTime
                }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-skeleton>
</template>

<script>
// import MessageButton from "cn/MessageButton";
// import Controls from "cn/Controls.vue";
export default {
  name: "UserCard",
  components: {
    // MessageButton,
    // Controls,
  },
  props: {
    // loading: {
    //   type: Boolean,
    //   default: true,
    // },
    // userInfo: {
    //   type: Object,
    //   default: () => {},
    // },
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoaded: false,
      userInfo: null,
    };
  },
  computed: {
    userProfileLink() {
      return `/u/${this.userInfo.username}`;
    },
  },
  filters: {
    formateReadTime(time) {
      const oneHour = 3600;
      if (time < 60) return "1分钟";
      else if (time < oneHour) {
        return Math.round(time / 60) + "分钟";
      } else {
        return (time / oneHour).toFixed(1) + "小时";
      }
    },
  },
  watch: {
    show: {
      async handler(status) {
        // 加载用户数据
        if (status) {
          const data = await this.$api.getUserInfo({
            userId: this.$attrs.userId,
          });

          !data && this.$message.error("出了些小问题");

          setTimeout(() => {
            this.userInfo = Object.freeze(data);

            this.isLoaded = true;
          }, 500);
        }
      },
      immediate: true,
    },
    userInfo(info) {
      // console.log(info);
    },
  },
  mounted() {
    // this.$bus.$on("closeUserPanel", () => {
    //   this.$emit("close");
    // });
  },
  methods: {
    handleLinkToPersona() {
      // this.$bus.$emit("currUserId", this.userInfo.userId);
      this.$router.push();
    },
  },
};
</script>

<style lang="postcss" scoped>
#lighter {
  background-color: rgba(255, 255, 255, 0.6);
  background-size: 110%;
}
</style>
