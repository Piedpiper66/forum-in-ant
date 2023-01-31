import Vue from "vue";

// prettier-ignore
const requireAll = (requireContext) => requireContext.keys().map(requireContext);
const req = require.context("/src/components/universe", false, /\.vue$/);
const componentsList = requireAll(req);

componentsList.forEach((item) => {
  Vue.component(item.default.name, item.default);
});
