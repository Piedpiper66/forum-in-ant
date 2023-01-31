<template>
  <div :key="text">{{ text }}</div>
</template>

<script>
export default {
  name: "MessageList",
  data() {
    return {
      text: "",
    };
  },
  watch: {
    "$route.params": {
      handler({ type }) {
        this.text = type;
      },
      immediate: true,
    },
  },
};
</script>
