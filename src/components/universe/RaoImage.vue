<template>
  <div
    class="relative overflow-hidden inline-block"
    :class="{ 'bg-gray-300': !src }"
  >
    <img
      :src="src"
      @click="handleViewerVisible"
      class="w-full h-full block border-solid max-w-full align-top"
      :style="{
        objectFit: fit,
        width: (size ?? '') + 'px',
        height: (size ?? '') + 'px',
      }"
      :class="{
        'rounded-1/2': avatar === undefined || avatar,
        'cursor-pointer': src,
        'opacity-0': !src,
      }"
    />
  </div>
</template>

<script>
import Photo from "./ImageViewer.vue";

export default {
  name: "RaoImage",
  props: {
    src: String,
    fit: {
      type: String,
      default: "cover",
    },
    size: {
      type: [Number, String],
    },
    avatar: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleViewerVisible() {
      if (!this.src) return false;

      this.create(Photo, { src: this.src, show: true });
    },
  },
};
</script>
