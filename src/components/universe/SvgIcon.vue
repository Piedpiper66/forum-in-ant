<template>
  <!-- aria-hidden="true" 无障碍属性，避免将无意义的讯息朗读出来 -->
  <svg
    :class="svgClass"
    aria-hidden="true"
    :style="{ width: size || width, height: size || width, fill }"
    :data-icon="name"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
export default {
  name: "Icon",
  props: {
    name: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "1.25rem",
    },
    height: {
      type: String,
      default: "1.25rem",
    },
    size: {
      type: String,
      default: "",
    },
    fill: {
      type: String,
      default: "currentColor",
    },
    spin: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`;
    },
    svgClass() {
      let prefix = "inline-block overflow-hidden";

      this.className && (prefix += ` ${this.className}`);

      if (this.spin === undefined || this.spin) {
        prefix += " animate-spin";
      }

      return prefix;
    },
  },
};
</script>
