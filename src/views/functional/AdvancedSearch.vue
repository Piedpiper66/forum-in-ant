<template>
  <transition name="slide-fade">
    <div v-show="shouldVisible" class="search flex space-x-4">
      <div class="w-2/3 mt-2">
        <div class="space-y-5 border-b border-bg-gray-200 pb-5 overflow-hidden">
          <!-- 搜索框 button -->
          <div class="flex space-x-3">
            <a-input
              placeholder="搜索主题或者帖子"
              v-model="normalQuery.keyword"
              clearable
              @keypress.enter.native="getQueryList"
              size="large"
              class="shadow-sm !focus:ring-0"
            >
            </a-input>
            <!-- w-16 text-lg h-9.5 flex items-center justify-center shadow-md text-shadow-lg -->
            <a-button type="primary" size="large" @click="getQueryList">
              <Icon name="search" />
            </a-button>
          </div>

          <!-- 打开编辑器的button -->
          <!-- prettier-ignore -->
          <div class="w-full flex">
            <div
              v-if="isLogin"
              class="nav-btn bg-gray-200 hover:(bg-gray-500 text-light-50) 
                shadow-md cursor-pointer transition-colors duration-300 flex items-center space-x-2 text-lg"
              :class="{
                'bg-gray-500 !text-light-50': editorShow,
              }"
              @click="openEditorWithNewTheme"
            >
              <Icon name="plus" />
              <span class="font-semibold"> 创建新主题 </span>
            </div>
          </div>

          <!-- 搜索结果的简讯 -->
          <div class="flex justify-between items-center">
            <span class="text-gray-600 truncate">
              搜索词:
              <span class="font-bold mr-2">{{ currQuery }}</span>
              <span v-show="isSearched">
                共有 {{ convertResultTotal }} 个搜索结果
              </span>
            </span>
            <!-- <span v-else></span> -->
            <div class="flex items-center space-x-2 text-gray-600">
              <span>按</span>
              <a-select
                :value="orderBy"
                allowClear
                @change="onOrderChange"
                placeholder="排序方式"
                class="min-w-30"
                :disabled="disableOrder"
              >
                <a-select-option
                  v-for="(value, key) in sortTypes"
                  :key="key"
                  :value="key"
                  :label="value"
                >
                  {{ value }}
                </a-select-option>
              </a-select>
              <span class="whitespace-nowrap">排序</span>
            </div>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <transition-group
          name="slide-fade"
          mode="out-in"
          tag="div"
          class="min-h-50"
        >
          <div
            class="search-list space-y-8 py-4"
            v-if="searchList && searchList.length"
            key="list"
          >
            <SearchCard
              v-for="(item, index) in searchList"
              :key="index"
              :info="item"
              :data-index="index"
              :currQuery="currQuery"
              :order="orderBy"
            />
          </div>

          <!-- 数据加载 -->
          <DataLoading v-if="isFetching" :show="isFetching" key="loading" />

          <!-- 无更多搜索结果 -->
          <div v-else-if="noMoreDividerVisible" key="noMore">
            <a-divider class="!px-10">
              <span class="text-gray-400 text-sm">没有更多了哦~</span>
            </a-divider>
          </div>

          <!-- 无搜索结果 -->
          <div
            v-else-if="isEmptyRes"
            class="mt-3 text-gray-400 flex flex-col space-y-3"
            key="empty"
          >
            <span>
              未搜索到与关键词
              <span class="font-bold text-gray-700">{{ currQuery }}</span>
              <span class="font-bold mx-1 text-gray-700" v-show="orderBy">
                {{ `按${sortTypes[orderBy]}` }}
              </span>
              <span class="font-normal">相关的{{ relativeWord }}</span>
            </span>
            <span>
              你可以选择
              <span
                class="text-green-400 cursor-pointer font-bold hover:(underline underline-2 underline-offset-2)"
                @click="openEditorWithNewTheme"
              >
                创建新主题
              </span>
            </span>
            <span class="space-y-3">
              <span>或者在搜索引擎中查询该关键词</span>
              <span class="flex items-center space-x-2 w-1/2">
                <Icon name="baidu" size="2.5rem" class="text-blue-500" />
                <a-input :value="currQuery"></a-input>
                <a-button type="primary" @click="goToSearchEngine('baidu')">
                  前往
                </a-button>
              </span>
              <span class="flex items-center space-x-2 w-1/2">
                <Icon name="google" size="2.5rem" class="text-orange-500" />
                <a-input :value="currQuery"></a-input>
                <a-button type="primary" @click="goToSearchEngine('google')">
                  前往
                </a-button>
              </span>
            </span>
          </div>
        </transition-group>

        <!-- <Data -->
      </div>

      <!-- selectbar -->
      <aside class="w-1/3 min-w-50">
        <section class="px-3 py-2 bg-gray-50 rounded-sm shadow-lg">
          <h1
            class="py-1 bg-gray-200 rounded-md shadow-md space-x-2 flex items-center justify-center"
          >
            <span class="text-gray-600 font-bold tracking-wider text-lg"
              >选择搜索条件</span
            >
            <!-- 离谱，在 clearOptions 方法里重置下面两个 Check 无效，这里就跑的通-->
            <span
              title="清空选项"
              class="cursor-pointer"
              @click="
                clearOptions(),
                  ((replyCountCheck = true), (viewCountCheck = true))
              "
            >
              <Icon
                name="dump"
                size="1rem"
                class="text-gray-400 inline-block hover:text-gray-500 transition-colors duration-300"
              />
            </span>
          </h1>
          <a-form :model="searchForm" label-position="top">
            <a-form-item label="来自用户">
              <a-select
                v-model="searchForm.users"
                mode="multiple"
                show-search
                placeholder="搜索用户"
                :show-arrow="isFetchingUserList"
                :filter-option="false"
                option-label-prop="label"
                @search="fetchUserDebounceFn"
                @blur="userList = []"
              >
                <Icon
                  slot="suffixIcon"
                  name="loading"
                  class="font-bold text-green-400"
                  spin
                />
                <a-select-option
                  v-for="item in userList"
                  :key="item.value"
                  :value="item.userId"
                  :label="item.username"
                  class="resize-select-h"
                >
                  <div class="flex items-center space-x-3">
                    <img :src="item.avatar" class="rounded-1/2 w-8.5 h-8.5" />
                    <span class="flex flex-col justify-center">
                      <span
                        class="text-gray-700 font-bold text-base"
                        v-text="item.username"
                      ></span>
                      <span
                        class="text-gray-400 text-sm"
                        v-text="item.fullname"
                      ></span>
                    </span>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="分类">
              <a-select
                v-model="searchForm.category"
                allowClear
                show-search
                optionFilterProp="children"
                :filter-option="filterCategoryOrTag"
                placeholder="请选择分类"
                option-label-prop="label"
              >
                <a-select-option
                  v-for="item in categories"
                  :key="item.alias"
                  :value="item.alias"
                  :label="item.name"
                >
                  <div class="space-x-3">
                    <Type :name="item.name" :noLink="true" />
                    <span class="text-gray-400 text-xs">{{
                      item.topicSum
                    }}</span>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="标签">
              <a-select
                v-model="searchForm.tags"
                mode="multiple"
                allowClear
                show-search
                optionFilterProp="children"
                :filter-option="filterCategoryOrTag"
                placeholder="请选择标签"
                option-label-prop="label"
              >
                <a-select-option
                  v-for="name in tagList"
                  :key="name"
                  :label="name"
                  :value="name"
                >
                  <Type :name="name" :noLink="true" />
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item>
              <a-checkbox
                v-model="searchForm.isMatchAllTag"
                :disabled="disableMatchAlltag"
                class="mt-1"
              >
                同时匹配以上所有标签
              </a-checkbox>
            </a-form-item>
            <a-form-item class="mt-2" label="只返回符合以下条件的主题或回复...">
              <!-- 复选 -->
              <a-checkbox-group
                v-model="searchForm.checkList"
                :options="checkOptions1"
              >
              </a-checkbox-group>

              <!-- 单选 -->
              <div class="flex" v-if="isLogin">
                <a-radio-group v-model="searchForm.seen">
                  <a-radio value="seen">我读过的</a-radio>
                  <a-radio value="unseen">我未读的</a-radio>
                  <a-radio value="all">都包括</a-radio>
                </a-radio-group>
              </div>
            </a-form-item>
            <a-form-item label="主题类型">
              <a-select
                v-model="searchForm.topicType"
                placeholder="请选择主题类型"
              >
                <a-select-option
                  v-for="(value, key) in topicTypes"
                  :key="key"
                  :value="key"
                  :label="value"
                >
                  {{ value }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="选择时间段">
              <a-date-picker
                v-model="searchForm.date"
                format="yyyy年MM月DD日"
                value-format="yyyy-M-DD"
                :disabled-date="copeDisableDate"
                placeholder="选择日期"
                class="w-full"
              ></a-date-picker>
              <a-radio-group
                v-model="searchForm.dateType"
                :disabled="
                  (!searchForm.date && (searchForm.dateType = ''),
                  !searchForm.date)
                "
              >
                <a-radio value="before">此日期之前</a-radio>
                <a-radio value="after" :disabled="disableDateAfter"
                  >此日期之后</a-radio
                >
                <a-radio value="today">当天</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="主题的回复数量">
              <!-- 
                :checked="replyCountCheck"
                @change="onReplyCheckChange"
               -->
              <a-checkbox
                :checked="replyCountCheck"
                @change="onReplyCheckChange"
              >
                忽略
              </a-checkbox>

              <div>
                <a-input-number
                  v-model="searchForm.postsRange.min"
                  :min="0"
                  @change="
                    (val) => {
                      validateMax('postsRange', val);
                    }
                  "
                ></a-input-number>
                <span class="sperator"></span>
                <a-input-number
                  v-model="searchForm.postsRange.max"
                  :min="searchForm.postsRange.min"
                ></a-input-number>
              </div>
            </a-form-item>
            <a-form-item label="主题的访问数量">
              <!-- 
                :checked="viewCountCheck" @change="onViewCheckChange"
              -->

              <a-checkbox :checked="viewCountCheck" @change="onViewCheckChange"
                >忽略</a-checkbox
              >
              <div>
                <a-input-number
                  v-model="searchForm.viewsRange.min"
                  @change="
                    (val) => {
                      validateMax('viewsRange', val);
                    }
                  "
                  :min="0"
                ></a-input-number>
                <span class="sperator"></span>
                <a-input-number
                  v-model="searchForm.viewsRange.max"
                  :min="searchForm.viewsRange.min"
                ></a-input-number>
              </div>
            </a-form-item>
            <a-form-item>
              <a-button
                class="w-full mt-3"
                @click="onSearchWithOptions"
                type="primary"
              >
                搜索
              </a-button>
            </a-form-item>
          </a-form>
        </section>
      </aside>
    </div>
  </transition>
</template>

<script>
import SearchCard from "../../components/search/SeachCard.vue";
import { mapGetters } from "vuex";
import Scroll from "../../mixins/scroll";

const topciTypes = {
  any: "任何类型",
  noReplies: "无回复",
  resolved: "已解决",
  unresolved: "未解决",
};

const sortTypes = {
  latestReply: "回复：最近",
  latestTopic: "主题：最近",
  support: "主题：点赞数",
  view: "主题：浏览量",
};

export default {
  name: "Search",
  components: {
    SearchCard,
  },
  mixins: [Scroll],
  beforeRouteUpdate(to, from, next) {
    next();
  },
  data() {
    return {
      // 当前页面是否显示，用于控制页面的 transition
      shouldVisible: false,
      // 普通搜索的 query
      normalQuery: {
        page: 1,
        pageSize: 10,
        keyword: void 0,
      },
      // 是否正在获取主题或回复的查询结果
      isFetching: false,
      // 主题或回复的搜索结果列表
      searchList: [],
      // 搜索到的总数
      resultCount: 0,
      // 排序类型
      sortTypes: Object.freeze(sortTypes),
      // 当前排序方式
      orderBy: void 0,
      // 侧边栏转换后的搜索选项的字符串形式
      searchOptions: null,
      // 选项式搜索的 query
      searchForm: {
        users: [],
        category: void 0,
        tags: [],
        isMatchAllTag: false,
        seen: "",
        checkList: [],
        topicType: void 0,
        dateType: "before",
        date: void 0,
        postsRange: { min: 0, max: 0 },
        viewsRange: { min: 0, max: 0 },
      },
      // Form 是否已经被改变，未改变则使用 this.searchOptions 来搜索
      isSearchFormChange: false,
      replyCountCheck: true,
      viewCountCheck: true,
      // 是否已经搜索过了主题或回复
      isSearched: false,
      // 用户列表
      userList: [],
      // 是否正在获取用户
      isFetchingUserList: false,
      // 标签列表
      tagList: [],
      // 主题类型
      topicTypes: Object.freeze(topciTypes),
    };
  },
  computed: {
    ...mapGetters([
      "userInfo",
      "userId",
      "isLogin",
      "categories",
      "editorShow",
    ]),
    convertResultTotal() {
      const sum = this.resultCount;
      return sum > 100 ? `${Math.floor(sum / 100) * 100} +` : sum;
    },
    currQuery() {
      return this.normalQuery.keyword;
    },
    isEmptyRes() {
      return (
        this.isSearched &&
        !this.isFetching &&
        (!this.searchList || (this.searchList && !this.searchList.length))
      );
    },
    noMoreDividerVisible() {
      return (
        ((!this.isFetching && this.noMoreData) ||
          (this.isSearched &&
            this.searchList.length < this.normalQuery.pageSize)) &&
        !this.isEmptyRes
      );
    },
    fetchUserDebounceFn() {
      return this.debounce(this.fetchUsers, 200);
    },
    checkOptions1() {
      const defaultOptions = [
        {
          value: "onlyTitle",
          label: "只针对标题搜索",
        },
      ];

      this.isLogin &&
        defaultOptions.push({
          value: "supported",
          label: "已点赞",
        });
      return defaultOptions;
    },
    // 为搜索到时的提示
    relativeWord() {
      return this.orderBy == "latestReply"
        ? "帖子"
        : this.orderBy == "latestTopic"
        ? "主题"
        : "帖子或主题";
    },
    disableDateAfter() {
      const now = new Date().toLocaleDateString().replaceAll("/", "-");
      return this.searchForm.date === now;
    },
    disableMatchAlltag() {
      return this.searchForm.tags.length < 2;
    },
    disableOrder() {
      return (
        !this.normalQuery.keyword || this.normalQuery.keyword.length < 2
        // ||!this.searchList.length
      );
    },
    // 当前 orderBy 为真且有搜索词，但列表为空，说明无结果，再次点击搜索则 orderBy 应重置
    shouldResetOrder() {
      return (
        this.normalQuery.keyword && this.orderBy && !this.searchList.length
      );
    },
  },
  watch: {
    "$route.query": {
      // 每次点击搜索都会走这里
      async handler({ q }) {
        if (q && q.length >= 2) {
          this.normalQuery.keyword = q;

          this.isSearched = false;

          this.searchList = [];
          console.log(this.searchOptions, this.isSearchFormChange);
          await this.copeSearch(q, 1);

          this.isSearched = true;
        }
      },
      immediate: true,
    },
    searchForm: {
      handler() {
        this.isSearchFormChange = true;
      },
      deep: true,
    },
    "searchForm.tags"(list) {
      if (!list.length) {
        this.searchForm.isMatchAllTag = false;
      }
    },
    "searchForm.postsRange": {
      handler() {
        this.replyCountCheck = false;
      },
      deep: true,
    },
    "searchForm.viewsRange": {
      handler() {
        this.viewCountCheck = false;
      },
      deep: true,
    },
  },
  async mounted() {
    // 初始 form 列表
    const origin = sessionStorage.getItem("originSearchForm");
    if (!origin) {
      sessionStorage.setItem(
        "originSearchForm",
        JSON.stringify(this.searchForm, (_, v) => (v === undefined ? null : v))
      );
    }

    // 标签去重
    this.$nextTick(() => {
      this.tagList = [
        ...new Set(
          this.categories.reduce((pre, next) => pre.concat(...next.tags), [])
        ),
      ];
    });

    // 滚动到底部获取列表数据
    this.$options.getList = () => {
      const keyword = this.normalQuery.keyword;
      if (this.isValidQuery(keyword, false) && this.searchList.length > 0) {
        this.copeSearch(keyword, this.normalQuery.page);
      }
    };

    // 用于 transition
    setTimeout(() => {
      this.shouldVisible = true;
    }, 30);
  },
  methods: {
    // 点击选项搜索按钮时的校验
    isValidQuery(query, tip = true) {
      const isValidQuery = query && query.length >= 2;

      if (!isValidQuery && tip) {
        this.$message.info("搜索词的长度至少为 2");
      }

      return isValidQuery;
    },
    // 在搜索框中的查询字符串改变后，搜索选项也应该被清空
    clearOptions() {
      this.searchOptions = null;
      const cache = JSON.parse(sessionStorage.getItem("originSearchForm"));
      Object.keys(cache).forEach(
        (k) => cache[k] === null && (cache[k] = void 0)
      );
      this.searchForm = cache;

      this.replyCountCheck = this.viewCountCheck = true;
    },
    onReplyCheckChange(e) {
      this.replyCountCheck = e.target.checked;
      this.isSearchFormChange = true;
    },
    onViewCheckChange(e) {
      this.viewCountCheck = e.target.checked;
      this.isSearchFormChange = true;
    },
    // 在发出请求前加一个中间层，进行校验和处理选项式搜索和普通搜索的区别
    async getQueryList() {
      // 这里本来要处理：如果搜索词相同就忽略，但考虑到数据更新，就算了
      if (this.isValidQuery(this.currQuery)) {
        if (this.orderBy || this.shouldResetOrder) {
          this.searchList = [];

          this.orderBy = void 0;

          // 如果点击按某种方式排序，则直接搜索
          await this.copeSearch(this.normalQuery.keyword, 1);
        } else {
          // 否则通过 watch $route.query 进行切换,
          // 查询字符 t => 防止跳转至重复的路由产生警告
          this.$router.replace({
            name: "search",
            query: { q: this.currQuery, t: Date.now() },
          });
        }
      }
    },
    // 点击搜索
    /**
     * @param { string } query 查询字符串
     * @param { number } page 当前页数
     * @param { any } searchOptions 搜索选项
     */
    async copeSearch(query, page) {
      this.isFetching = true;

      this.noMoreData = false;

      const searchOptions = this.isSearchFormChange
        ? (this.searchOptions = this.generateSearchOptions())
        : this.searchOptions;

      console.log(searchOptions);

      this.isSearchFormChange = false;

      const searchQuery = {
        q: query,
        page,
        pageSize: this.normalQuery.pageSize,
        user: 0, // 筛选结果是否需要 user
        order: this.orderBy,
        limit: searchOptions || undefined,
      };

      // 用户已登录
      if (
        searchOptions &&
        (searchOptions.includes("supported") || searchOptions.includes("seen"))
      ) {
        searchQuery.userId = this.userId;
      }

      // 总数 | 当前的数据
      const { total, records } = await this.$api.search(searchQuery);

      this.resultCount = total;

      // 长度为0，或者该次数据小于单次的限制数量，则表示已经没有数据了
      if (!records.length || records.length < this.normalQuery.pageSize)
        this.noMoreData = true;

      this.normalQuery.page++;

      setTimeout(() => {
        this.isFetching = false;
        this.searchList = this.searchList.concat(records);
      }, 300);
    },
    generateSearchOptions() {
      let query = this.normalQuery.keyword;

      if (!this.isValidQuery(query)) return false;

      const tokens = [];

      let searchOptions;

      const iterator = Object.entries(this.searchForm).filter(([k, v]) => {
        if (k == "postsRange") return !this.replyCountCheck;
        if (k == "viewsRange") return !this.viewCountCheck;
        return !this.isEmpty(v);
      });

      if (iterator.length > 0) {
        // 构造查询字符串
        for (const [key, value] of iterator) {
          let str = "";

          if (key == "date") str = `date=${+new Date(value)}`;
          else if (!!~key.lastIndexOf("Range"))
            str = `${key}=${value.min},${value.max}`;
          else if (key == "isMatchAllTag") str = `${key}=${value ? 1 : 0}`;
          else str = `${key}=${value}`;

          tokens.push(str);
        }

        searchOptions = tokens.join("&");
      } else {
        searchOptions = null;
      }

      return searchOptions;
    },
    onSearchWithOptions() {
      if (this.isValidQuery(this.currQuery)) {
        if (this.shouldResetOrder) {
          this.orderBy = void 0;
        }

        this.searchList = [];

        this.copeSearch(this.currQuery, 1);

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    // 选项侧边栏中的搜索用户
    async fetchUsers(query) {
      this.userList = [];

      if (query) {
        this.isFetchingUserList = true;

        const users = await this.$api.searchUser(query);

        this.isFetchingUserList = false;

        this.userList = users;
      }
    },
    // el-select 过滤类别或标签列表
    filterCategoryOrTag(input, option) {
      const compareWord = option.componentOptions.propsData.label;
      return compareWord.indexOf(input) >= 0;
    },
    // 点击排序方式
    onOrderChange(value) {
      this.orderBy = value;
      this.searchList = [];
      this.copeSearch(this.normalQuery.keyword, 1);
    },
    goToSearchEngine(type) {
      let url = "";

      switch (type) {
        case "baidu":
          url = `https://www.baidu.com/s?ie=UTF-8&wd=${this.currQuery}`;
          break;
        case "google":
          url = `https://www.google.com/search?q=${this.currQuery}&ie=UTF-8`;
        default:
          break;
      }

      window.open(url);
    },
    isEmpty(value) {
      return !value || (Array.isArray(value) && !value.length);
    },
    copeDisableDate({ _d }) {
      return +_d > Date.now();
    },
    validateMax(type, val) {
      if (this.searchForm[type].max < val) {
        this.searchForm[type].max = val;
      }
    },
    openEditorWithNewTheme() {
      // prettier-ignore
      const { themeConfig: { getInitialValue } } = this.$root.$children[0].$children.find(
        ({ $el: { id } }) => id === "editor"
      );

      this.$store.dispatch("setEditorStatus", {
        type: "theme",
        info: getInitialValue(),
      });
    },
    validateInput() {},
  },
};
</script>

<style lang="postcss" scoped>
.sperator {
  @apply inline-block border-t-2 border-t-gray-400 w-4 align-middle mx-3;
}

.search >>> .ant-form-item {
  margin-bottom: 10px;
}
</style>
