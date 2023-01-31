import Vue from "vue";

// prettier-ignore
const requireAll = (requireContext) => requireContext.keys().map(requireContext);
const req = require.context("./", false, /\.js$/);
const directiveList = requireAll(req).filter(
  (item) => Object.keys(item).length > 0
);

directiveList.forEach((directives) => {
  Object.entries(directives).forEach(([name, directive]) => {
    Vue.directive(name, directive);
  });
});
