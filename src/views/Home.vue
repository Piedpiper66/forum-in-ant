<template>
  <!-- 主页 -->
  <div id="home" class="pt-10 w-full">
    <!-- 导航栏 -->
    <a-row type="flex" class="space-x-3">
      <a-col class="space-x-3">
        <!-- 类目 -->
        <a-select
          :value="selectQuery.category.name"
          placeholder="所有分类"
          style="width: 140px"
          @change="onCategoryChange"
          :dropdownMatchSelectWidth="false"
          dropdownClassName="w-20"
          size="large"
        >
          <a-select-option
            v-for="item in categoryList"
            :key="item.alias"
            :value="item._id"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
        <!-- 标签 -->
        <a-select
          :value="selectQuery.tag"
          @change="onTagChange"
          placeholder="所有标签"
          style="width: 140px"
          size="large"
        >
          <a-select-option v-for="item in tagList" :key="item" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-col>
      <!-- 文字导航 -->
      <a-col flex="auto" class="flex flex-row justify-between mt-2 md:mt-0">
        <nav
          class="flex h-full select-none justify-between items-center"
          @click="handleNavClick"
        >
          <div class="space-x-3 transition-all duration-300">
            <span
              v-for="(nav, index) in navList"
              :key="index"
              class="nav nav-btn leading-8"
              :class="[
                currentTypeFlag === index ? 'nav-btn-focus' : 'nav-btn-hover',
              ]"
              :value="index"
              :type="nav.name"
              :title="nav.tip"
            >
              {{ nav.title }}
            </span>
          </div>
        </nav>
        <!-- 控制编辑器显隐 -->
        <!-- prettier-ignore -->
        <div
          v-if="isLogin"
          class="nav nav-btn shadow-md select-none
            bg-gray-200 hover:(bg-gray-500 text-white) space-x-1"
          :class="{ 'nav-btn-focus': editorShow }"
          @click="toggleEditor"
        >
          <Icon name="plus" className="font-bold" />
          <span>{{$store.state.app.unfinishedEdit ? editorShow ? '关闭草稿' : '打开草稿' : '创建新主题'}}</span>
        </div>
      </a-col>
    </a-row>

    <!-- 内容视图 -->
    <a-spin
      :spinning="loading"
      v-show="loading"
      size="large"
      tip="Vue Forum Loading ..."
      class="select-none"
    >
      <div class="loading-h"></div>
      <Icon slot="indicator" name="smile" size="2.25rem" spin />
    </a-spin>
    <router-view
      @callForDisplay="onChildReady"
      v-if="isRouterAlive"
    ></router-view>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  // 在路由更新之前执行, 防止错误的 tag 被渲染
  beforeRouteUpdate(to, _, next) {
    let canPass = true;

    const { tagname } = to.params;

    if (tagname && !this.tagList.includes(tagname)) {
      canPass = false;
      this.$message.info(`标签 ${tagname} 不存在，请不要作怪`);
    }

    canPass && next();
  },
  provide() {
    return {
      // 强制刷新复用的组件，防止由于导航点击过快导致之前加载的元素缓存至最后的导航页面中
      // 在子组件的 $route 变更之后调用
      homeReload: this.reload,
    };
  },
  data() {
    return {
      overview: {
        title: "分类",
        name: "index",
        path: "/overview",
      },
      navList: [
        {
          title: "最新",
          name: "latest",
          path: "/type/latest",
        },
        {
          title: "近期",
          name: "recent",
          path: "/type/recent",
          tip: "近七天主题",
        },
        {
          title: "热门",
          name: "hot",
          path: "/type/hot",
        },
      ],
      // 刷新组件
      isRouterAlive: true,
      categoryList: [],
      tagList: [],
      // 文字导航下标
      currentTypeFlag: 0,
      // 数据是否仍在加载中
      loading: true,
      // select 值
      selectQuery: {
        category: { _id: "", name: void 0, alias: "" },
        tag: void 0,
      },
      // 判断组件是否是第一次渲染
      isInited: false,
      // 编辑器是否出现
      editorVisible: false,
    };
  },
  computed: {
    ...mapGetters(["isLogin", "editorShow", "categories", "unfinishedEdit"]),
  },
  watch: {
    "$route.fullPath": {
      handler(to) {
        this.loading = true;
        // 如果路由切换为根路径，则需要将两个 select 的值都置空
        if (to === "/overview") {
          this.selectQuery.category = this.createEmptyCate();

          this.selectQuery.tag = void 0;

          this.removeRecord(true, true);

          this.addOverview();
        } else if (this.hasRouteParams()) {
          this.removeOverview();

          this.isInited && this.setSelectsValueFromRoute();
        }

        // 当从非 select 跳转到指定类别或标签对应的dataList时，select 也应该更改
        // console.log("$route.fullPath");

        // 此时 this.navList 还未更新，须等到 navList 更新完成之后再切换
        this.$nextTick(() => {
          // 变更 navList 的视图
          const { type } = this.$route.params;

          const findResult = this.navList.findIndex(
            ({ name }) => name === type
          );

          // 找不到说明处于 overview 上
          this.currentTypeFlag = findResult === -1 ? 0 : findResult;
        });
      },
      immediate: true,
    },
    "selectQuery.category"(curr) {
      // 同时更改当前的 tagList
      const { tags } = curr;
      // 无 params
      if (!tags) this.setTags();
      else {
        this.tagList = tags;
        // 防止刷新页面丢失数据
        sessionStorage.setItem("indexInfo_cate", JSON.stringify(curr));
      }
    },
  },
  async created() {
    await this.setCategories();

    // 如果 $route.params 中存在 category, 则 tagList 使用对应 categoryList 中的 tags
    // prettier-ignore
    const { params: { category } } = this.$route;
    if (category) {
      const { tags } = this.categoryList.find(
        ({ alias }) => alias === category
      );
      this.tagList = tags;
    } else {
      // 不存在 category 则请求全部 tag
      await this.setTags();
    }

    this.setSelectsValueFromRoute();
  },
  mounted() {
    this.isInited = true;

    // history: category
    const lastCate = sessionStorage.getItem("indexInfo_cate");
    this.selectQuery.category =
      lastCate === null ? this.createEmptyCate() : JSON.parse(lastCate);

    // history: tagName
    const lastTag = sessionStorage.getItem("indexInfo_tag");
    this.selectQuery.tag = lastTag === null ? void 0 : lastTag;

    if (!this.hasRouteParams()) this.addOverview();
  },
  methods: {
    // 通过路由信息设置 select 的值
    setSelectsValueFromRoute() {
      const { category, tagname } = this.$route.params;

      this.$nextTick(() => {
        if (category) {
          const target = this.getTargetCategory("alias", category);

          this.selectQuery.category = target;
        } else {
          this.selectQuery.category = this.createEmptyCate();
        }
        this.selectQuery.tag = tagname || void 0;
      });
    },
    async setCategories() {
      // prettier-ignore
      const categories = await this.$api.getCategories();
      this.categoryList = categories || [];
    },
    async setTags() {
      // prettier-ignore
      const tags = await this.$api.getTags();
      this.tagList = tags || [];
    },
    getTargetCategory(prop, value) {
      const target = this.categoryList.find((cate) => value === cate[prop]);
      return target ? target : this.createEmptyCate();
    },
    onCategoryChange(cateId) {
      this.selectQuery.category = this.getTargetCategory("_id", cateId);
      this.selectQuery.tag = void 0;

      // 去除 tag 的历史纪录，否则刷新后会回到之前的状态
      this.removeRecord(false, true);

      this.linkToDataList();
    },
    onTagChange(tag) {
      this.selectQuery.tag = tag;

      sessionStorage.setItem("indexInfo_tag", tag);

      this.linkToDataList();
    },
    // 在点击 select-item || nav-item 之后跳转到对应视图
    // linkType: latest || current || hot
    linkToDataList(linkType) {
      // prettier-ignore
      // 前往的路由
      const { category: { name, alias }, tag } = this.selectQuery;
      // prettier-ignore
      // 当前路由
      const { params: { tagname, category, type } } = this.$route;

      const isSameParams = tag === tagname && category === alias;
      // 防止重复点击相同的路由： select 重复 和 navList 重复
      if (isSameParams && linkType === type) return false;

      // prettier-ignore
      this.$router.push({
        name: name ? (tag ? "fullQuery" : "cateOnly") : (tag ? "tagOnly" : "typeOnly"),
        params: { category: alias, tagname: tag, type: linkType || "latest" },
      });
    },
    // 注意：路由变更之后才会触发
    handleNavClick({ target }) {
      // 如果 e.target 不是 span 标签则忽略，防止误触
      if (target.tagName !== "SPAN") return false;

      this.currentTypeFlag = +target.getAttribute("value");

      const currentType = target.getAttribute("type");

      if (currentType === "index") {
        // 防止 overview 重复点击，linkToDataList 中处理的是包含 type 类型的路由
        if (this.$route.name === "overview") return false;

        this.$router.push({ name: "overview" });

        this.currentTypeFlag = 0;

        return false;
      }

      this.linkToDataList(currentType);
    },
    createEmptyCate() {
      return { _id: "", name: void 0, alias: "" };
    },
    hasRouteParams() {
      const { category, tagname } = this.$route.params;
      return !!(category || tagname);
    },
    addOverview() {
      // prettier-ignore
      this.navList[0].name !== "index" && this.navList.unshift(this.overview);
    },
    removeOverview() {
      this.navList[0].name === "index" && this.navList.shift();
    },
    // 接收 router-view 中 $emit 方法传递的加载结束的信号
    onChildReady() {
      this.loading = false;
    },
    removeRecord(removeCate, removeTag) {
      removeCate && sessionStorage.removeItem("indexInfo_cate");
      removeTag && sessionStorage.removeItem("indexInfo_tag");
    },
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(function () {
        this.isRouterAlive = true;
      });
    },
    toggleEditor() {
      // 如果没有草稿
      if (!this.unfinishedEdit) {
        const {
          themeConfig: { getInitialValue },
        } = this.$parent.$children.find(({ $el: { id } }) => id === "editor");

        this.$store.dispatch("setEditorStatus", {
          type: "theme",
          info: getInitialValue(),
        });
      } else {
        // 如果有草稿，则直接控制显隐，不切换类型
        this.$store.dispatch("setEditorStatus", !this.editorShow);
      }
    },
  },
};
</script>

<style lang="postcss" scoped>
.sort-card {
  box-shadow: -1.5px 1px 5px rgba(0, 0, 0, 0.06);
}

/* 覆盖 antdv 中的 a-col 的定宽 */
.dynamic-col {
  @apply w-full md:w-1/2;
}

/* 导航视图的最小高，使得正常显示加载图标 */
.loading-h {
  min-height: calc(100vh - 9.25rem);
}

div.nav-btn {
  @apply flex items-center;
}
</style>
