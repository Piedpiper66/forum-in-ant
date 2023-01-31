const { resolve } = require("path");

module.exports = {
  productionSourceMap: false,
  chainWebpack: (config) => {
    // svg 规则
    const svgRule = config.module.rule("svg");
    // 清除已有的loader, 如果不清除会在原有loader之后再使用当前loader规则
    svgRule.uses.clear();
    // 正则匹配排除node_modules目录
    svgRule.exclude.add(/node_modules/);
    // 添加svg新的loader处理
    svgRule
      .test(/\.svg$/)
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      });

    // 去除 svg 指定的属性
    svgRule
      .test(/\.svg$/)
      .use("svgo-loader")
      .loader("svgo-loader")
      .options({
        plugins: [
          {
            name: "removeAttrs",
            params: {
              attrs: [
                "fill",
                "fill-rule",
                "class",
                "height",
                "width",
                "opacity",
              ],
            },
          },
        ],
      });

    // 修改images loader，添加svg处理
    const imagesRule = config.module.rule("images");
    imagesRule.exclude.add(resolve("src/assets/svg"));
    config.module.rule("images").test(/\.(png|jpe?g|gif|svg)(\?.*)?$/);
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          // 更换 ant-design-vue 的主色由蓝色改变为绿色
          "primary-color": "#26d362",
        },
        javascriptEnabled: true,
      },
    },
  },
  devServer: {
    // 解析完毕后是否自动打开浏览器
    open: true,
    host: "localhost",
    port: process.env.PORT || 8080, //  前端端口
    https: false,
    hotOnly: false,
    // 将 host:port 的请求转换为localhost: 3000
    proxy: "http://localhost:3000",
  },
  pluginOptions: {
    windicss: {
      // see https://github.com/windicss/vite-plugin-windicss/blob/main/packages/plugin-utils/src/options.ts
    },
  },
};
