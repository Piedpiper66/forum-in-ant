<template>
  <!-- 圆点 + 文章类型的标签 -->
  <span
    class="space-x-2 text-gray-400 font-normal text-xs select-none"
    :title="description"
  >
    <span
      class="inline-block w-2 h-2 rounded-full shadow-md"
      :style="{ background: currentBg(name) }"
    ></span>
    <router-link
      :to="toTagLink(name)"
      class="overflow-ellipsis whitespace-nowrap overflow-hidden text-gray-600"
    >
      {{ name }}
    </router-link>
  </span>
</template>

<script>
export default {
  name: "Type",
  inject: ["categoryColorTable"],
  props: {
    name: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    noLink: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    toTagLink() {
      return (name) => {
        const isCate = Object.keys(this.categoryColorTable).includes(name);
        return {
          name: isCate ? "cateOnly" : "tagOnly",
          params: {
            category: isCate ? this.categoryColorTable[name][0] : "",
            tagname: !isCate ? name : "",
            type: "latest",
          },
        };
      };
    },
    currentBg() {
      return (name) => {
        if (!Object.keys(this.categoryColorTable).includes(name))
          return "#a3a3a3";
        return this.categoryColorTable[name][1];
      };
    },
  },
};
</script>
