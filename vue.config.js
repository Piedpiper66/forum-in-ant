const { resolve } = require("path");
const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isProd = process.env.NODE_ENV === "production";

// cdn预加载使用
const externals = !isProd
  ? {}
  : {
      vue: "Vue",
      "vue-router": "VueRouter",
      vuex: "Vuex",
      axios: "axios",
    };

const cdn = {
  // 生产环境
  build: {
    js: [
      "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js",
      "https://cdn.jsdelivr.net/npm/vue-router@3.2.0/dist/vue-router.min.js",
      "https://cdn.jsdelivr.net/npm/vuex@3.4.0/dist/vuex.min.js",
      "https://cdn.jsdelivr.net/npm/axios@1.2.1/dist/axios.min.js",
    ],
  },
};

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

    //
    if (isProd) {
      config.optimization.delete("splitChunks");
      config.optimization.delete("minimizer");

      config.plugin("html").tap((args) => {
        args[0].cdn = cdn.build;
        return args;
      });
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@ant-design/icons/lib/dist$": resolve(
          __dirname,
          "src/utils/antIcons.js"
        ),
      },
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new CompressionWebpackPlugin({
        test: /\.(js|css|svg|woff|ttf|json|html)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
    externals,
    optimization: {
      minimizer: [
        new TerserPlugin({
          // test: [/\.m?js(\?.*)?$/i, /\.vue(\?.*)?$/i, /\.ss(\?.*)?$/i],
          // include: resolve("src/"),
          parallel: true,
          extractComments: true,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
      splitChunks: {
        chunks: "all",
        minSize: 25000,
        minChunks: 1, // 模块至少使用次数
        maxAsyncRequests: 6, // 同时加载的模块数量最多是5个，只分割出同时引入的前5个文件
        maxInitialRequests: 3, // 首页加载的时候引入的文件最多3个
        automaticNameDelimiter: "~", // 缓存组和生成文件名称之间的连接符
        name: true, // 缓存组里面的filename生效，覆盖默认命名
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: "initial",
          },
          commons: {
            name: "chunk-commons",
            test: resolve(__dirname, "src/components"), // can customize your rules
            minChunks: 2, //  minimum common number
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: "manifest",
      },
    },
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
};
