<template>
  <div class="flex justify-center">
    <div class="loader" :class="{ show: $attrs.show }">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Loading",
  // props: ["show"],
};
</script>

<style scoped>
.loader {
  opacity: 0;
  display: flex;
  /* position: fixed; */
  /* bottom: 30px; */
  /* transition: all 0.3s ease-in; */
  /* left: 50%; */
  /* transform: translateX(-50%); */
}

.loader.show {
  opacity: 1;
}

.circle {
  background-color: #34d399;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 5px;
  animation: myBounce 0.5s ease-out infinite;
}

.circle:nth-of-type(2) {
  animation-delay: 0.1s;
}

.circle:nth-of-type(3) {
  animation-delay: 0.2s;
}

@keyframes myBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
