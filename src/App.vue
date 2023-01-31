<template>
  <div id="app" class="flex min-w-125 overflow-x-hidden" v-cloak>
    <!-- 头部 -->
    <GlobalHeader />

    <!-- content -->
    <section class="main w-full flex justify-center mt-15">
      <div
        class="w-full lg:w-4/5 max-w-275 py-5 px-3 transition-all duration-300"
      >
        <!-- 之所以在此处没用 transition 和 a-spin 是因为 router-view 中的数据请求都应该由子组件自身进行渲染 -->
        <router-view v-if="isRouterAlive" />
      </div>
    </section>

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
import { io } from "socket.io-client";

export default {
  name: "App",
  components: {
    GlobalHeader,
    Editor,
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
      isLogin: false,
    };
  },
  methods: {
    reload() {
      this.isRouterAlive = false;

      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    },
  },
  async created() {
    const isLogin = this.$store.getters.isLogin;

    this.isLogin = isLogin;

    if (isLogin) {
      const { data: userInfo } = await this.$api.vertify();

      this.$store.commit("SET_USERINFO", userInfo);

      const socket = io("http://localhost:3000");

      // socket.on("connects", (data) => {
      //   alert(data);
      // });

      socket.emit("connection", "client-msg");

      // socket.on("chat", (data) => {
      //   console.log("socketData:", data);
      // });

      // socket.emit("chat", "client data");
    }

    // 用于头部和编辑器等组件中的类目共享
    const categories = await this.$api.getCategories();

    this.$store.commit("SET_CATEGORY", categories || []);
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
