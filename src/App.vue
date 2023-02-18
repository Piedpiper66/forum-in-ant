<template>
  <!-- overflow-xxx 会导致子元素或孙子元素或。。 的 position: sticky 失效 -->
  <div
    id="app"
    class="flex min-w-125 min-h-screen"
    :class="{ 'overflow-x-hidden': !isInTheme }"
    v-cloak
  >
    <div class="fixed w-full flex justify-center z-9999">
      <alert
        v-if="isOtherDeviceLogin"
        type="info"
        show-icon
        closable
        class="!absolute top-10"
        @close="isOtherDeviceLogin = false"
      >
        <!-- left-1/2 transform -translate-x-1/2 -->
        <Icon slot="closeText" name="close" />
        <span slot="message" class="font-bold text-lg leading-3 text-gray-600">
          通知
        </span>
        <p slot="description" class="font-bold text-xl text-gray-500 mt-5">
          您的账号已经在
          <span class="text-gray-600">{{ geoText }}</span>
          的另一台设备上登录, 你已被强制下线!
        </p>
      </alert>
    </div>

    <!-- 头部 -->
    <GlobalHeader />

    <!-- content -->
    <main class="main w-full flex justify-center mt-15">
      <div
        class="w-full lg:w-4/5 max-w-275 py-5 px-3 transition-all duration-300"
      >
        <!-- 之所以在此处没用 transition 和 a-spin 是因为 router-view 中的数据请求都应该由子组件自身进行渲染 -->
        <router-view v-if="isRouterAlive" />
      </div>
    </main>

    <!-- 编辑器 -->
    <Editor v-if="isLogin" />

    <!-- 回到顶部: 编辑器打开时不显示 -->
    <a-back-top v-show="!$store.getters.editorShow">
      <!-- prettier-ignore -->
      <div
        class="flex items-center justify-center px-2.5 py-3 
        rounded-1/2 shadow-xl bg-gray-50 text-green-400 text-lg
        hover:bg-sky-50 transition-colors duration-200"
        title="回到顶部"
      >
        <Icon name="arrow-up" />
      </div>
    </a-back-top>
  </div>
</template>

<script>
import GlobalHeader from "./components/header/Header.vue";
import Editor from "./components/editor/Index.vue";
import { Alert } from "ant-design-vue";
import { mapGetters } from "vuex";

export default {
  name: "App",
  components: {
    GlobalHeader,
    Editor,
    Alert,
  },
  provide() {
    return {
      categoryColorTable: {
        // 类目颜色类名映射标
        general: "general",
        frontend: "frontend",
        backend: "backend",
        自由讨论: ["general", "#fbbf24"],
        前端: ["frontend", "#38bdf8"],
        后端: ["backend", "#a78bfa"],
      },
      appReload: this.reload,
    };
  },
  data() {
    return {
      isRouterAlive: true,
      isOtherDeviceLogin: false,
      otherDeviceGeo: null,
    };
  },
  computed: {
    ...mapGetters(["isLogin", "devId"]),
    isInTheme() {
      return this.$route.name === "theme";
    },
    geoText() {
      return (
        this.otherDeviceGeo &&
        Object.keys(this.otherDeviceGeo).reduce(
          (str, key) => str + `${this.otherDeviceGeo[key]} `,
          ""
        )
      );
    },
  },
  watch: {
    isLogin: {
      handler: async function (status) {
        if (status) {
          const { data: userInfo } = await this.$api.vertify();

          const socketMapId = `${userInfo?.userId}_${this.devId}`;

          this.$store.commit("SET_USERINFO", userInfo ?? null);

          this.socket.connect();

          // 在服务端创建用户id 和该 socket id 的映射关系
          this.socket.emit("conn", socketMapId);

          // 连接
          this.socket.on("conn", (data) => {
            console.log("socket 已连接 !");
          });

          this.socket.on("connect", () => {
            console.log("已重新链接");
            // 断连重新发送注册 id
            this.socket.emit("conn", socketMapId);
          });

          // 如果有其他人成功登录，则该设备强制下线
          this.socket.on("forceLogout", async (geo) => {
            console.log("call for logout");
            await this.$store.dispatch("logout");
            console.log("store logout finish");

            console.log("isLogin:", this.isLogin);
            this.isOtherDeviceLogin = true;
            this.otherDeviceGeo = geo;
            console.log("set Geo, beofore reload");
            location.reload();
            console.log("reload over");
          });
        } else {
          this.socket.disconnect();
        }
      },
      immediate: true,
    },
  },
  async created() {
    // 用于头部和编辑器等组件中的类目共享
    const categories = await this.$api.getCategories();
    this.$store.commit("SET_CATEGORY", categories || []);
  },
  methods: {
    reload() {
      this.isRouterAlive = false;

      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    },
  },
};
</script>

<style lang="postcss">
[v-cloak] {
  @apply bg-gray-600;
}

#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

body {
  overflow-y: scroll;
}
</style>
