<template>
  <div class="timeline sticky top-30 text-gray-400 font-light tracking-wider">
    <!-- 头部 startTime -->
    <div class="reply-time whitespace-nowrap" v-date.live="times[0]"></div>

    <!-- 滚动区域 -->
    <div
      class="timeline-scrollarea h-75 border-l-green-200 border-l-1 transform scale-x-60 my-1"
    >
      <div
        class="current transition-all duration-300 w-2 h-12 top-0 bg-green-200 rounded-md relative -left-1"
        ref="marker"
      >
        <div class="absolute transform scale-x-160 left-15 w-max flex flex-col">
          <span class="text-gray-800 font-semibold"
            >{{ currTimeLinePosi + 1 }} / {{ offsets.length }}</span
          >
          <span v-date.live="times[currTimeLinePosi]"></span>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div
      class="last-reply whitespace-nowrap"
      v-date.live="times[times.length - 1]"
    >
      {{ endTime }}
    </div>
  </div>
</template>

<script>
import { timeFormat } from "../../utils/format";

export default {
  name: "TimeLine",
  props: {
    times: {
      type: Array,
      default: [],
    },
    offsets: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      offsetSize: 0,
      currTimeLinePosi: 0,
    };
  },
  computed: {
    startTime() {
      return timeFormat(this.times[0], false);
    },
    endTime() {
      return timeFormat(this.times[this.times.length - 1], false);
    },
    currentTime() {
      return timeFormat(this.times[this.currTimeLinePosi], false);
    },
    timelineThrottleFn() {
      return this.throttle(this.setTimeLinePosi, 50, true, this);
    },
  },
  watch: {
    currTimeLinePosi(val) {
      this.$refs.marker.style.top = this.offsetSize * val + "px";
    },
    offsets(value) {
      // 游标每次在纵轴上移动的距离: ( 轴总高 - 游标高度 ) / ( 总数 - 1 )
      this.offsetSize = (300 - 48) / (value.length - 1);

      window.onscroll = this.timelineThrottleFn.bind(this, value);
    },
  },
  beforeDestroy() {
    window.onscroll = null;
  },
  methods: {
    /**
     * 设置当前时间线的位置
     * @param { array } offsets `vnode` 偏移量数组
     */
    setTimeLinePosi(offsets) {
      const scrollY = window.pageYOffset;

      // 计算每个元素的偏移量与当前窗口偏移的差值
      const offsetDiffs = offsets.map((offset) => scrollY - offset);

      // 值为正且值最小的那个便是目标位置，因为已经看过的 Reply 计算的也是正值，最小值便是当前元素偏移量
      const min = Math.min(...offsetDiffs.filter((diff) => diff > 0));

      // 找出最小值对应的序号
      const targetIndex = offsetDiffs.findIndex((diff) => diff === min);

      this.currTimeLinePosi = targetIndex < 0 ? 0 : targetIndex;
    },
  },
};
</script>
