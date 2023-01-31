const requireAll = (requireContext) =>
  requireContext.keys().map(requireContext);
const req = require.context("/src/assets/svg", false, /\.svg$/);

requireAll(req);
