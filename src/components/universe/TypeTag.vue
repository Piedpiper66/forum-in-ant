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
    <span
      @click="!noLink && toTagLink()"
      class="overflow-ellipsis whitespace-nowrap overflow-hidden text-gray-600"
      :class="{ 'hover:text-green-400 cursor-pointer': !noLink }"
    >
      {{ name }}
    </span>
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
  methods: {
    toTagLink() {
      const isCate = Object.keys(this.categoryColorTable).includes(this.name);
      let currentCateParamName;

      if (
        isCate &&
        (currentCateParamName = this.categoryColorTable[this.name][0]) ==
          this.$route.params.category
      )
        return false;

      this.$router.push({
        name: isCate ? "cateOnly" : "tagOnly",
        params: {
          category: isCate ? currentCateParamName : "",
          tagname: !isCate ? this.name : "",
          type: "latest",
        },
      });
    },
    currentBg() {
      if (!Object.keys(this.categoryColorTable).includes(this.name))
        return "#a3a3a3";
      return this.categoryColorTable[this.name][1];
    },
  },
};
</script>
