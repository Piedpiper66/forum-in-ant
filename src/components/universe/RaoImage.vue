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
        width: getSize().width,
        height: getSize().height,
      }"
      :class="{
        'rounded-1/2': avatar === undefined || avatar,
        'cursor-pointer': !!src,
        'opacity-0': !src,
      }"
    />
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "RaoImage",
  props: {
    src: String,
    fit: {
      type: String,
      default: "cover",
    },
    size: [
      Number,
      String,
      [
        [Number, String],
        [Number, String],
      ],
    ],
    avatar: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    async handleViewerVisible() {
      if (!this.src) return false;

      this.create(require("./ImageViewer.vue").default, {
        src: this.src,
        show: true,
      });
    },
    getSize() {
      const size = this.size;
      // 如果时数字，则默认 + “px”
      // 如果是字符，parseInt 为假则 void 0, 为真则直接用
      // 如果 isAvatar 为假，则 size 应该为 [width: number|string, height: number|string] ,
      // 否则 width = height
      const isAvatar = this.avatar;
      const isValidTypeWhenAvatar = Array.isArray(size);

      let _width;
      let _height;

      if (isAvatar || !isValidTypeWhenAvatar) {
        _width = _height = this.fixSize(size);
      } else {
        const [width, height] = size;

        _width = this.fixSize(width);
        _height = this.fixSize(height);
      }

      return {
        width: _width,
        height: _height,
      };
    },
    fixSize(size) {
      const _size = parseInt(size);
      const isPlainNumber = +size === _size;
      return _size ? (isPlainNumber ? _size + "px" : _size) : void 0;
    },
    /**
     * 将组件挂载到 Body 上
     * @param Component 组件实例的选项对象
     * @param props 组件实例中的prop
     */
    create(Component, props) {
      const comp = new (Vue.extend(Component))({ propsData: props }).$mount();

      document.body.appendChild(comp.$el);

      comp.remove = () => {
        document.body.removeChild(comp.$el);

        comp.$destroy();
      };

      return comp;
    },
  },
};
</script>
