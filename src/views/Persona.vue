<template>
  <page-loading :loading="!isLoaded && !hasFirstLoaded">
    <div
      id="persona"
      class="flex flex-col space-y-8"
      v-if="isLoaded && userBasicInfo"
      key="content"
    >
      <div id="persona-header" class="rounded-xl shadow-lg mt-5 select-none">
        <!-- header 最外层用于在伪元素中加入背景 -->
        <div
          class="persona-header-bg z-1 p-5 relative overflow-hidden select-none space-y-5 rounded-xl"
          :class="[hasHeaderBg ? headerTheme + ' text-shadow-lg' : '']"
        >
          <!-- 基本信息 -->
          <div class="flex space-x-5">
            <!-- 头像 -->
            <img
              :src="userBasicInfo.avatar"
              class="shadow-lg rounded-full w-30 h-30"
            />
            <!-- 用户名 | 坐标 | 个人介绍 -->
            <div class="flex flex-col">
              <div>
                <p class="text-2xl font-extrabold mb-0 truncate" title="用户名">
                  {{ userBasicInfo.username }}
                </p>
                <p class="font-thin text-gray-500 mb-1 mb-0" title="全名">
                  {{ userBasicInfo.fullname ?? "" }}
                </p>
              </div>
              <div class="my-3 cursor-pointer text-gray-600" title="所在位置">
                <template v-if="userBasicInfo.location">
                  <Icon name="location" size="1.5rem" />
                  <span class="font-thin">{{ userBasicInfo.location }}</span>
                </template>
              </div>
              <!-- 个人介绍 -->
              <p class="mb-0 font-thin text-gray-400" title="个性签名">
                {{
                  userBasicInfo.introduction
                    ? `" ${userBasicInfo.introduction} "`
                    : "这个人很懒，什么都没留下"
                }}
              </p>
            </div>
          </div>
          <!-- 基本活动信息介绍 -->
          <div class="text-gray-500 text-base space-x-5">
            <span class="space-x-3">
              <span>加入时间</span>
              <strong
                class="mx-1 text-gray-600"
                v-date.CN.live.suffix="userBasicInfo.createDate"
              ></strong>
            </span>
            <span class="space-x-3">
              <span>最后发帖</span>
              <strong
                class="mx-1 text-gray-600"
                v-date.CN.live.suffix="userBasicInfo.lastPostDate"
              ></strong>
            </span>
            <span class="space-x-3 whitespace-nowrap">
              <span>最后活动</span>
              <strong
                class="mx-1 text-gray-600"
                v-date.CN.live.suffix="userBasicInfo.lastActivity"
              ></strong>
            </span>
            <span class="space-x-3 whitespace-nowrap">
              <span>浏览</span>
              <strong
                class="mx-1 text-gray-600"
                v-number.toK="userBasicInfo.visitCount"
              ></strong>
            </span>
          </div>
          <!-- 私信按钮 -->
          <div
            class="absolute right-5 top-0 primary-btn"
            v-if="isLogin && !isSelf"
            @click="onCreatePrivate"
          >
            <Icon name="mail" /><span>私信 Ta</span>
          </div>
        </div>
      </div>

      <!-- 文字导航 -->
      <ul @click="onSwitchRoute" class="overflow-hidden space-x-5">
        <li
          v-for="(item, index) in currentRoutes"
          :key="index"
          :data-index="index"
          class="float-left nav nav-btn"
          :class="[currentActive === index ? 'nav-btn-focus' : 'nav-btn-hover']"
        >
          {{ item.name }}
        </li>
      </ul>

      <!-- 当前路由的视图 -->
      <transition name="slide-fade" mode="out-in">
        <!-- 缓存 summary, 因为数据较多，节省切换之后重新请求带来的开销 -->
        <keep-alive :exclude="excludeCache">
          <!-- <component :is="currentComponentName"></component> -->
          <!-- filterRoute: boolean 登陆状态的不同显示不同的导航 -->
          <router-view
            :filterRoute="shouldFilterRoute"
            :excludeCache="excludeCache"
            @hasRefreshSelf="excludeCache = []"
            @resetBtnRoute="onModifyBtnRoute"
            class="pl-3"
          ></router-view>
        </keep-alive>
      </transition>
    </div>
  </page-loading>
</template>

<script>
import { mapGetters } from "vuex";
import Activity from "../pages/persona/Activity.vue";
import Summary from "../pages/persona/Summary.vue";

// 用于动态变更头部背景图片
const _styleSheet = document.styleSheets[1];

const canvas = document.createElement("canvas");
const context = canvas.getContext && canvas.getContext("2d");

export default {
  name: "Persona",
  components: {
    Activity,
    Summary,
  },
  inject: ["appReload"],
  data() {
    return {
      routeList: [
        {
          name: "概要",
          keyword: "summary",
          route: { name: "summary", params: { username: "" } },
        },
        {
          name: "活动",
          keyword: "activity",
          route: {
            name: "activityList",
            params: { username: "", type: "all" },
          },
        },
        {
          name: "消息",
          loginRoute: true,
          keyword: "message",
          route: {
            name: "messageList",
            params: { username: "", type: "send" },
          },
        },
        {
          name: "设置",
          loginRoute: true,
          keyword: "preference",
          route: {
            name: "account",
            params: { username: "", type: "account" },
          },
        },
      ],
      currentActive: 0,
      isLoaded: false,
      // 在一次刷新之后，整体页面不需要刷新，只要刷新 router-view 中的即可
      // 除非是不同的 user
      hasFirstLoaded: false,
      userBasicInfo: null,
      // 根据用户头部的背景图片更换文字颜色
      headerTheme: "",
      // 当用户头像更换之后, summary 需要清除缓存, 防止未变更
      excludeCache: [],
    };
  },
  computed: {
    ...mapGetters(["isLogin", "editorShow", "userId"]),
    filteredRoutes() {
      return this.routeList.filter(({ loginRoute }) => !loginRoute);
    },
    // 登录、退出登录，从用户自己的界面跳转到别人的界面都需要改变
    currentRoutes() {
      return this.isLogin
        ? this.isSelf
          ? this.routeList
          : this.filteredRoutes
        : this.filteredRoutes;
    },
    isSelf() {
      return this.userId === this.userBasicInfo?.userId;
    },
    shouldFilterRoute() {
      return !this.isLogin || !this.isSelf;
    },
    hasHeaderBg() {
      return !!this.userBasicInfo.headerBg;
    },
  },
  watch: {
    "$route.params": {
      handler: async function ({ username }, from) {
        // 如果是从某个人的个人主页跳转到另一个人的个人主页上，重新加载
        if (from && username !== from.username) {
          this.appReload();

          return false;
        }
        // 在本页跳转到另一个用户的 Persona 会先进入 appReload, 进入以下逻辑后会再进入以下逻辑
        // hasFirstLoaded 防止 appReload 导致的重复请求, 因为第二次并没有刷新 app, hasFirstLoaded 状态保留
        if (!this.hasFirstLoaded && (!from || username !== from.username)) {
          await this.getUserBasicInfo(username);

          // 更细路由参数
          this.routeList.forEach(({ route }) => {
            route.params.username = this.userBasicInfo.username;
          });

          // 更换背景
          const { headerBg } = this.userBasicInfo;

          if (headerBg) {
            this.toggleCssRule(headerBg);

            await this.setPrimaryTheme(headerBg);
          }
        }

        const fullPath = this.$route.fullPath;

        // 切换导航按钮的颜色
        const currentIndex = this.routeList.findIndex(
          ({ keyword }) => fullPath.indexOf(keyword) > 0
        );

        this.currentActive = currentIndex;
      },
      immediate: true,
    },
  },
  created() {
    if (this.isLogin) {
      // 在用户更换头部图片时，此时进行预览
      this.$bus.$on("updateHeaderBg", async (imgUrl) => {
        this.userBasicInfo.headerBg = imgUrl;

        this.toggleCssRule(imgUrl);

        this.setPrimaryTheme(imgUrl);
      });

      this.$bus.$on("updateHeaderAvatar", (imgUrl) => {
        this.userBasicInfo.avatar = imgUrl;

        this.excludeCache.push("Summary");
      });
    }
  },
  destroyed() {
    this.clearBg();
  },
  methods: {
    async getUserBasicInfo(username) {
      this.isLoaded = false;

      const userInfo = await this.$api.getUserInfo({ username });

      this.userBasicInfo = userInfo;

      setTimeout(() => {
        this.isLoaded = true;

        this.hasFirstLoaded = true;
      }, 500);
    },
    toggleCssRule(url) {
      const cssText = `#persona-header, .persona-header-bg::before {
        background-image: url(${url})  ;
      }`;

      if (!this.hasSetHeaderBg()) {
        _styleSheet.insertRule(cssText, 0);
      } else {
        _styleSheet.deleteRule(0);

        _styleSheet.insertRule(cssText, 0);
      }
    },
    clearBg() {
      const _styleSheet = document.styleSheets[1];

      this.hasSetHeaderBg() && _styleSheet.deleteRule(0);
    },
    hasSetHeaderBg() {
      return (
        _styleSheet.cssRules[0].cssText.indexOf("persona-header-bg") !== -1
      );
    },
    // 通过背景颜色的深浅，来选择文字是黑色还是白色
    setPrimaryTheme(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        const _this = this;

        img.onload = () => {
          // URL.revokeObjectURL(this.src)
          const RGB = this.getRGB(img);

          const average = Object.values(RGB).reduce((p, n) => p + n) / 3;

          const theme = average <= 128 ? "light-theme" : "dark-theme";

          this.headerTheme = theme;

          resolve();
        };

        img.crossOrigin = "Anonymous";

        img.src = url;
      });
    },
    getRGB(imgEl) {
      // only visit every 5 pixels
      const blockSize = 5;

      // for non-supporting envs
      const defaultRGB = {
        r: 0,
        g: 0,
        b: 0,
      };

      // prettier-ignore
      let data, width, height, i = -4, length, count = 0,
          rgb = {
            r: 0,
            g: 0,
            b: 0,
          };

      if (!context) {
        return defaultRGB;
      }

      height = canvas.height =
        imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
      width = canvas.width =
        imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

      context.drawImage(imgEl, 0, 0);

      try {
        data = context.getImageData(0, 0, width, height, {
          willReadFrequently: true,
        });
      } catch (e) {
        /* security error, img on diff domain */
        return defaultRGB;
      }

      length = data.data.length;

      while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
      }

      // ~~ used to floor values
      rgb.r = ~~(rgb.r / count);
      rgb.g = ~~(rgb.g / count);
      rgb.b = ~~(rgb.b / count);

      return rgb;
    },
    onSwitchRoute({ target }) {
      if (target.tagName === "LI") {
        const { name } = this.$route;

        const { index } = target.dataset;

        const { route } = this.routeList.at(+index);

        if (route.name === name) return false;

        this.currentActive = +index;

        this.$router.push(route);
      }
    },
    onCreatePrivate() {
      const { username, userId } = this.userBasicInfo;

      this.$store.dispatch("setEditorStatus", {
        type: "private",
        info: {
          to: [{ label: username, value: userId }],
          title: void 0,
          content: "",
        },
      });
    },
    // 由于每个子组件都被缓存，而切换路由的 btn 的跳转路径是不变的
    // 这就导致路由与组件不匹配，此时因更改跳转的路由
    onModifyBtnRoute({ root, type }) {
      const { route } = this.routeList.find(({ keyword }) => keyword === root);

      if (root === "preference") {
        route.name = type;
      } else {
        route.params.type = type;
      }
    },
  },
};
</script>

<style lang="postcss" scoped>
.persona-header-bg::before {
  content: "";
  z-index: -1;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  filter: blur(6px);
  margin: -30px;
  background-size: cover;
  background-position: center;
}

.light-theme {
  p,
  strong,
  span,
  svg {
    color: #fff;
    @apply text-shadow-lg;
  }
}

.dark-theme {
  p,
  span,
  strong,
  svg {
    color: #000;
    text-shadow: 3px 3px 6px rgb(255 255 255 / 26%),
      0 0 5px rgb(255 255 255 / 22%);
  }
}
</style>
