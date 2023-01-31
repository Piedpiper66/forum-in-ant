<template>
  <a-popover
    v-model="visible"
    trigger="click"
    placement="bottomRight"
    :overlayStyle="{ zIndex: 1101, maxWidth: '17.5rem' }"
    overlayClassName="category"
  >
    <div class="inline-flex items-center justify-center p-1 icon-hover">
      <Icon
        name="list"
        size="2rem"
        fill="#9ca3af"
        className="cursor-pointer outline-none"
      />
    </div>
    <div
      slot="content"
      class="inline-flex flex-wrap px-3 py-4"
      @click="onLinkClick"
    >
      <!-- 即刻 -->
      <a-divider>
        <span class="text-xs text-gray-400 tracking-wider">即刻</span>
      </a-divider>
      <div class="flex flex-wrap w-full">
        <router-link
          v-for="item in theMomentRoutes"
          :key="item.route"
          :to="item.route"
          class="category-item-wrap px-3 bg-gray-100 mb-3 mr-3"
        >
          {{ item.name }}
        </router-link>
      </div>

      <!-- 类别 -->
      <a-divider>
        <span class="text-xs text-gray-400 tracking-wider">主题类别</span>
      </a-divider>
      <div class="flex flex-wrap w-full" v-if="categories.length">
        <span
          v-for="(cate, index) in categories"
          :key="index"
          class="category-item-wrap mb-3 mr-3"
          :class="[copeTypeBg(cate.name)]"
        >
          <Type :name="cate.name" style="font-size: 0.85rem" />
        </span>
      </div>
      <div v-else class="w-full py-2 text-center">
        <span class="text-gray-300 text-xs">暂无类别</span>
      </div>
    </div>
  </a-popover>
</template>

<script>
export default {
  name: "Category",
  inject: ["categoryColorTable"],
  data() {
    return {
      visible: false,
      theMomentRoutes: [
        { name: "最新", route: "/type/latest" },
        { name: "近期", route: "/type/recent" },
        { name: "热门", route: "/type/hot" },
      ],
    };
  },
  computed: {
    categories() {
      return this.$store.getters.categories;
    },
  },
  methods: {
    copeTypeBg(name) {
      const value = this.categoryColorTable[name];
      const prefix = Array.isArray(value) ? value[0] : value;
      return prefix + "-bg";
    },
    onLinkClick({ target }) {
      if (target.tagName === "A") this.visible = false;
    },
  },
};
</script>

<style lang="postcss">
.category-item-wrap {
  @apply px-2 py-1 rounded-md shadow-sm hover:shadow-md space-x-5;
}

.category {
  a:hover {
    @apply text-gray-600;
  }

  .ant-divider-horizontal {
    margin: 0.5rem 0 !important;
  }
}
</style>
