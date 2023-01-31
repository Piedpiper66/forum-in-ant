<template>
  <a-popover
    v-model="visible"
    trigger="click"
    placement="bottom"
    overlayClassName="search"
    :overlayStyle="{ zIndex: 1009 }"
  >
    <div class="inline-flex items-center justify-center p-1 icon-hover">
      <Icon
        name="search"
        size="2rem"
        fill="#9ca3af"
        className="cursor-pointer outline-none"
      />
    </div>
    <div
      ref="searchContent"
      slot="content"
      class="flex space-x-3 p-3 w-100 relative"
      @mousewheel.self.prevent
    >
      <a-select
        ref="search"
        show-search
        :value="searchValue"
        style="flex: 1"
        dropdownClassName="search"
        placeholder="搜索分类、主题、回复或用户"
        :default-active-first-option="false"
        :dropdownMatchSelectWidth="false"
        :dropdownMenuStyle="{ maxWidth: '23.5rem', zIndex: 1009 }"
        :show-arrow="showSelectLoadingIcon"
        :filter-option="false"
        :not-found-content="notFoundContent"
        :dropdownRender="reRenderDropdown"
        :getPopupContainer="() => $refs.searchContent"
        @search="handleSearch"
        @change="handleChange"
        @dropdownVisibleChange="handleDropdownVisible"
        @hook:mounted="avoidWindowScroll"
      >
        <Icon slot="suffixIcon" name="loading" spin />
        <a-select-option v-if="isInvalidInput" key="empty">
          <span class="inline-block w-full text-center text-gray-400 my-3">
            查询长度需要大于1
          </span>
        </a-select-option>
        <a-select-opt-group v-for="group in groupOptions" :key="group.label">
          <span slot="label" class="inline-block w-full font-bold text-base">
            {{ group.label }}
          </span>
          <a-select-option
            v-for="(item, index) in group.options"
            :key="group.label + index"
            :value="item.value"
          >
            <!-- 用户 -->
            <router-link
              v-if="group.label === '用户'"
              :to="{
                name: 'summary',
                params: { username: item.username },
              }"
            >
              <div class="flex space-x-4 py-2 text-gray-400 text-base">
                <a-avatar :src="item.avatar"></a-avatar>
                <div class="flex flex-col justify-center">
                  <span v-html="highlightKeyword(item.username)"></span>
                  <span v-html="highlightKeyword(item.fullname)"></span>
                </div>
              </div>
            </router-link>

            <!-- 主题和回复 -->
            <div v-else class="py-2">
              <router-link
                :to="{
                  name: 'theme',
                  params: { themeId: item.topicId },
                  query: { rId: item.replyId },
                }"
                class="flex flex-col"
              >
                <div class="mb-2">
                  <!-- 标题 -->
                  <span class="flex items-center text-base">
                    <span
                      v-show="item.isResolve"
                      title="该主题已有解决方案"
                      class="mr-1"
                    >
                      <Icon name="resolve" className="text-gray-500" />
                    </span>
                    <span
                      v-html="highlightKeyword(item.title, 'title')"
                      class="text-green-400"
                    ></span>
                  </span>
                  <!-- 类别 -->
                  <Type :name="item.categoryName" class="text-sm" />
                </div>
                <!-- 正文 -->
                <p
                  v-html="highlightKeyword(item.content || item.markdown)"
                  class="text-xs break-normal whitespace-pre-line"
                ></p>
              </router-link>
            </div>
          </a-select-option>
        </a-select-opt-group>
      </a-select>
      <a-button
        type="primary"
        @click="
          () =>
            $router.push({ name: 'search', query: { q: searchValue } }) &&
            (visible = false)
        "
        >选项</a-button
      >
    </div>
  </a-popover>
</template>

<script>
// 用于辅助高亮数据中的关键字
const toolDiv = document.createElement("div");

export default {
  name: "Search",
  data() {
    return {
      iconMap: {
        主题: "topic",
        用户: "user",
        回复: "reply",
      },
      visible: false,
      searchValue: void 0,
      searchResults: [],
      groupOptions: [],
      queryForMoreResult: "",
      isInvalidInput: false,
      showSelectLoadingIcon: false,
      notFoundContent: null,
    };
  },
  watch: {
    visible(status) {
      this.$nextTick(() => {
        const action = status ? "focus" : "blur";
        this.$refs.search[action]();
      });
    },
  },
  methods: {
    reRenderDropdown(menuVNode, props) {
      // console.log(menuVNode, props);
      // 会出现警告 avoid muted state directly ...
      // props.transitionName = "fadeInOut";
      return menuVNode;
    },
    async handleSearch(query = "") {
      this.notFoundContent = query ? "暂无数据" : null;

      this.searchValue = query;

      if (query && query.length < 2) {
        this.isInvalidInput = true;

        this.groupOptions = [];

        return false;
      } else if (query.length >= 2) {
        this.showSelectLoadingIcon = true;

        this.isInvalidInput = false;

        this.groupOptions = [];

        // 用于查看更多的链接中的参数值
        this.queryForMoreResult = query;

        const { users, records } = await this.$api.search({
          q: query,
          page: 1,
          pageSize: 5,
          user: 1,
        });
        // prettier-ignore
        const topics = [], replies = [];

        if (users.length > 0) {
          this.groupOptions.push({
            label: "用户",
            options: Object.freeze(users),
          });
        }

        records.forEach((record) => {
          const { type } = record;
          type === "topic" && topics.push(record);
          type === "reply" && replies.push(record);
        });

        if (topics.length > 0) {
          this.groupOptions.push({
            label: "主题",
            options: Object.freeze(topics),
          });
        }

        if (replies.length > 0) {
          this.groupOptions.push({
            label: "回复",
            options: Object.freeze(replies),
          });
        }

        this.showSelectLoadingIcon = false;
      }
    },
    /**
     * @param {string} text 需要解析的文本
     * @param {"title" | "content"} type 是标题还是内容
     */
    highlightKeyword(text, type = "content") {
      if (text) {
        // 被高亮的关键字前后的字符数量，超过切换为 `...`, 否则原样拼接
        // const adjacentLen = 50;
        toolDiv.innerHTML = text;

        // 目标关键字所在文本的起始序号
        const startIndex = text.indexOf(this.searchValue);

        // 如果文本不包含关键字，直接返回所有文字内容
        if (startIndex === -1) return toolDiv.textContent;

        const reg = new RegExp(this.searchValue, "g");

        const replaceNode = `<span class='emphasis-${type} font-bold text-shadow-sm'>${this.searchValue}</span>`;

        text = text
          .replace(/[<>\n]/g, (str) => {
            if (str === "<") return "&lt;";
            else if (str === ">") return "&gt;";
            else return "\t";
          })
          .replace(reg, () => replaceNode);

        return text;
      }

      return text;
    },
    handleChange() {
      this.visible = false;
      this.searchValue = void 0;
    },
    handleDropdownVisible(status) {
      if (!status) {
        this.groupOptions = [];
        this.searchValue = void 0;
        this.isInvalidInput = false;
      }
    },
    avoidWindowScroll() {},
  },
};
</script>

<style lang="postcss">
.search {
  a:hover {
    @apply text-gray-600;
  }

  .ant-select-dropdown-menu {
    max-height: 70vh;
  }

  .emphasis-content {
    @apply text-gray-600;
  }

  .ant-popover-arrow {
    display: none !important;
  }
}

.emphasis-title {
  @apply text-green-400;
}
</style>
