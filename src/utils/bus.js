import Vue from "vue";

// 由于某些 js 文件中需要调用某些组件的方法
// 但直接调用该组件的方法会导致 this 指向错误
// 所以 bus 单独提取出来共用,使得 JS 文件和 vue 组件间能够正常通信
export default new Vue();
