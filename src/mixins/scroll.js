const html = document.documentElement;

export default {
  data() {
    return {
      noMoreData: false,
      isFetching: false,
    };
  },
  computed: {
    scrollDebounceFn() {
      return this.debounce(this.getDataOnScroll, 30);
    },
  },
  mounted() {
    document.addEventListener("scroll", this.scrollDebounceFn);
  },
  beforeDestroy() {
    document.removeEventListener("scroll", this.scrollDebounceFn);
  },
  methods: {
    async getDataOnScroll() {
      if (!this.noMoreData && !this.isFetching) {
        const { scrollHeight, scrollTop, clientHeight } = html;
        if (scrollTop + clientHeight === scrollHeight) {
          this.isFetching = true;

          await this.$options.getList();

          this.isFetching = false;
        }
      }
    },
  },
};
