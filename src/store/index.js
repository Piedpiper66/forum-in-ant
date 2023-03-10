import Vue from "vue";
import Vuex from "vuex";
import getters from "./getters";

Vue.use(Vuex);

const modulesFiles = require.context("./modules", true, /\.js$/);

const modules = modulesFiles.keys().reduce(
  (modules, modulePath) => {
    // set './app.js' => 'app'
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, "$1");

    const module = modulesFiles(modulePath);

    modules[moduleName] = module.default;

    return modules;
  },
  {} /* <--- 初始对象 modules */
);

const store = new Vuex.Store({
  modules,
  getters,
});

export default store;
