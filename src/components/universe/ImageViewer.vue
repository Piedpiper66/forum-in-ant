<style lang="postcss">
.viewer-btn {
  @apply absolute z-2 flex items-center justify-center opacity-80 cursor-pointer box-border select-none;
}
</style>
<template>
  <div
    v-if="visible"
    class="fixed z-2011 top-0 right-0 bottom-0 left-0"
    @mousewheel.prevent="onScaleImage"
  >
    <div class="absolute w-full h-full top-0 left-0 opacity-50 bg-black"></div>
    <span
      class="viewer-btn right-10 top-10 h-10 w-10 rounded-1/2 text-2xl text-white bg-[#606266]"
      @click="onCloseViewer"
    >
      <Icon name="close" class="font-extrabold" />
    </span>
    <div
      class="viewer-btn bottom-7.5 left-1/2 transform -translate-x-1/2 w-70.5 h-11 px-5.5 rounded-[22px] bg-[#606266] text-white"
    >
      <div
        class="w-full h-full text-justify flex items-center justify-around cursor-default"
        @click="onImageChange"
      >
        <Icon name="zoomIn" class="cursor-pointer" size="1.7rem" />
        <Icon name="zoomOut" class="cursor-pointer" size="1.7rem" />
        <i></i>
        <Icon :name="currentScaleIcon" class="cursor-pointer" size="1.6rem" />
        <i></i>
        <Icon name="rotate-cck" class="cursor-pointer" size="1.45rem" />
        <Icon name="rotate-ck" class="cursor-pointer" size="1.45rem" />
      </div>
    </div>
    <div class="w-full h-full flex items-center justify-center">
      <img
        ref="image"
        class="z-1 perspect-0 transition-all duration-300"
        :src="src"
        alt="图片"
        :style="{
          maxHeight: currentScaleIcon === 'fullscreen' ? '100%' : '',
          maxWidth: currentScaleIcon === 'fullscreen' ? '100%' : '',
        }"
        @mousedown="onImageMousedown"
        @mouseup="onImageMouseup"
      />
    </div>
  </div>
</template>

<script>
import Icon from "./SvgIcon.vue";

let imgClassList = null;

let imgEl = null;

export default {
  name: "Photo",
  props: {
    src: String,
    show: Boolean,
  },
  components: { Icon },
  data() {
    return {
      visible: false,
      currentZoom: 1,
      currentDeg: 0,
      currentScaleIcon: "fullscreen",
      currentMousedownAxis: { x: 0, y: 0 },
      lastMouseupMargin: null,
      isAlreadyMousedown: false,
    };
  },
  watch: {
    show: {
      handler(status) {
        this.visible = status;
      },
      immediate: true,
    },
  },
  mounted() {
    imgEl = this.$refs.image;
    imgClassList = imgEl.classList;

    this.initMargin();

    window.addEventListener("keydown", this.onEscClose);
  },
  methods: {
    onImageChange({ target }) {
      const { tagName } = target;

      if (!["use", "svg"].includes(tagName)) return false;

      if (tagName === "use") target = target.parentElement;

      const { icon } = target.dataset;

      this.classIfRemoveAdd();

      switch (icon) {
        case "zoomIn":
          this.currentZoom += 0.2;
          break;
        case "zoomOut":
          // , 0.200000...1 - 0.2 失去精度成为极小的负数
          const nextZoom = (this.currentZoom * 10 - 2) / 10;

          this.currentZoom = nextZoom < 0 ? 0 : nextZoom;
          break;
        case "fullscreen":
          this.currentScaleIcon = "scale-to-original";
          this.currentZoom = 1;
          this.initMargin();
          break;
        case "scale-to-original":
          this.currentScaleIcon = "fullscreen";
          this.currentZoom = 1;
          this.currentDeg = 0;
          this.initMargin();
          break;
        case "rotate-ck":
          this.currentDeg += 90;
          break;
        case "rotate-cck":
          this.currentDeg -= 90;
          break;
      }

      this.setTransform();
    },
    onScaleImage({ wheelDeltaY }) {
      this.classIfContainRemove();

      const shouldScaleDown = this.currentZoom - 0.03 >= 0;

      if (wheelDeltaY > 0) this.currentZoom += 0.03;
      else
        shouldScaleDown ? (this.currentZoom -= 0.03) : (this.currentZoom = 0);

      this.setTransform();
    },
    onImageMousedown(e) {
      // 防止出现禁止图标
      e.preventDefault();

      Object.assign(this.currentMousedownAxis, { x: e.clientX, y: e.clientY });

      this.isAlreadyMousedown = true;

      document.addEventListener("mousemove", this.onImageMove);

      document.addEventListener("mouseleave", this.onImageMouseup);

      // 防止鼠标移动太快导致鼠标不在图片上时，onImageMouseup 没有触发
      document.addEventListener("mouseup", this.onImageMouseup);
    },
    onImageMove({ clientX, clientY }) {
      if (this.isAlreadyMousedown) {
        this.classIfContainRemove();

        requestAnimationFrame(() => {
          // 小于 0 往右拖， 大于 0 往左拖
          const xDiff = this.currentMousedownAxis.x - clientX;

          // 小于 0 往下拖， 大于 0 往上拖
          const yDiff = this.currentMousedownAxis.y - clientY;

          // imgEl.style.transform = `translate(${-xDiff}px, ${-yDiff}px)`;
          imgEl.style.marginLeft = `${
            this.lastMouseupMargin.marginLeft - xDiff
          }px`;
          imgEl.style.marginTop = `${
            this.lastMouseupMargin.marginTop - yDiff
          }px`;
        });
      }
    },
    onImageMouseup({ clientX, clientY }) {
      this.isAlreadyMousedown = false;

      Object.assign(this.lastMouseupMargin, {
        marginLeft: parseInt(imgEl.style.marginLeft),
        marginTop: parseInt(imgEl.style.marginTop),
      });

      Object.assign(this.currentMousedownAxis, { x: clientX, y: clientY });

      this.classIfRemoveAdd();

      document.removeEventListener("mousemove", this.onImageMove);

      document.removeEventListener("mouseleave", this.onImageMouseup);

      document.removeEventListener("mouseup", this.onImageMouseup);
    },
    setTransform() {
      imgEl.style.transform = `rotate(${this.currentDeg}deg) scale(${this.currentZoom})`;
    },
    onEscClose({ key }) {
      key === "Escape" && this.onCloseViewer();
    },
    onCloseViewer() {
      this.visible = false;

      this.$nextTick(() => {
        window.removeEventListener("keydown", this.onEscClose);

        // create 方法中生成的，从 body 移出 el
        this.remove();
      });
    },

    // ---------- tool ------------
    classIfContainRemove() {
      if (imgClassList.contains("duration-300")) {
        imgClassList.remove("duration-300");
        imgClassList.remove("transition-all");
      }
    },
    classIfRemoveAdd() {
      if (!imgClassList.contains("duration-300")) {
        imgClassList.add("duration-300");
        imgClassList.add("transition-all");
      }
    },
    initMargin() {
      imgEl.style.marginTop = "0";

      imgEl.style.marginLeft = "0";

      this.lastMouseupMargin = {
        marginLeft: 0,
        marginTop: 0,
      };
    },
  },
};
</script>
