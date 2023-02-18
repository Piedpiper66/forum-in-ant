<template>
  <header
    id="header"
    class="w-full h-15 transform shadow-md flex justify-center fixed z-1100 select-none"
  >
    <div
      class="inner relative w-full lg:(w-4/5 px-0) px-3 h-full flex items-center justify-between max-w-275 space-x-4 transition-all duration-300"
      ref="inner"
    >
      <!-- 图标 -->
      <div class="logo transi-300 hover:scale-110" title="Rao Forum">
        <router-link to="/overview">
          <img :src="imgSrc" alt="Vue Forum" class="w-12" />
        </router-link>
      </div>

      <!-- 文章详情显示的标题 -->
      <section class="article-title flex-1 flex flex-col font-semibold px-3">
        <transition-group name="fadeInOut" mode="out-in">
          <div
            v-if="titleInfo"
            class="truncate text-xl text-shadow-md"
            key="title"
          >
            {{ titleInfo.title }}
          </div>
          <div v-if="titleInfo" class="flex items-center space-x-3" key="type">
            <Type
              v-if="titleInfo.category"
              :name="titleInfo.category.name"
              :description="titleInfo.category.description"
            />
            <template v-if="titleInfo.tags">
              <Type v-for="tag in titleInfo.tags" :key="tag" :name="tag" />
            </template>
          </div>
        </transition-group>
      </section>

      <!-- 功能区 -->
      <div class="functional">
        <!-- 登录前 -->
        <div class="before-login space-x-3 flex items-center" v-if="!isLogin">
          <transition name="fadeInOut">
            <a-button
              type="primary"
              class="font-bold"
              v-show="registerBtnShow"
              @click="switchRegisterModal"
            >
              注册
            </a-button>
          </transition>
          <a-button type="primary" @click="switchLoginModal">登录</a-button>
        </div>

        <!-- 快速搜索 -->
        <Search />

        <!-- 类目快捷入口 -->
        <Category />

        <!-- 登陆后 -->
        <User v-if="isLogin && userInfo" :userInfo="userInfo" />
      </div>
    </div>

    <!-- 登录模态框 -->
    <LoginModal
      :loginVisible="loginModalShow"
      @switchToClose="loginModalShow = false"
    />

    <!-- 注册模态框 -->
    <RegisterModal
      :registerVisible="registerModalShow"
      @switchToClose="registerModalShow = false"
    />
  </header>
</template>

<script>
import Search from "./Search.vue";
import Category from "./Category.vue";
import User from "./User.vue";
import LoginModal from "./Login.vue";
import RegisterModal from "./Register.vue";
import { mapGetters } from "vuex";

document.head.setAttribute("style", "filter: blur(5px)");
const bgSetResult = !!document.head.style.filter;

export default {
  name: "GlobalHeader",
  components: {
    Search,
    Category,
    User,
    LoginModal,
    RegisterModal,
  },
  data() {
    return {
      imgSrc: require("../../assets/img/logo.png"),
      titleInfo: null,
      loginModalShow: false,
      registerModalShow: false,
    };
  },
  computed: {
    registerBtnShow() {
      return !(this.titleInfo && this.titleInfo.title);
    },
    ...mapGetters(["isLogin", "userInfo"]),
  },
  created() {
    this.$bus.$on("titleEmerge", (info) => {
      this.titleInfo = info;
    });

    this.$bus.$on("showLoginModal", () => {
      this.loginModalShow = true;
    });

    this.$bus.$on("showRegisterModal", () => {
      this.registerModalShow = true;
    });
  },
  mounted() {
    // 不支持CSS 的 filter 属性，则设置背景为 白色
    !bgSetResult && this.$refs.inner.style.setProperty("--bg-color", "#fff");
  },
  methods: {
    switchLoginModal() {
      this.loginModalShow = true;
    },
    switchRegisterModal() {
      this.registerModalShow = true;
    },
  },
};
</script>

<style lang="postcss" scoped>
.functional {
  @apply items-center space-x-3
  transition-opacity duration-300 hidden md:flex;
}

.inner::before {
  content: "";
  z-index: -1;
  position: fixed;
  display: block;
  height: 100%;
  width: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-color, rgba(255, 255, 255, 0.3));
  backdrop-filter: blur(15px);
}
</style>
