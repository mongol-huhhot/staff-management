
const { defineConfig } = require('@vue/cli-service')
const { String } = require('core-js')
const chunkPrefix = '[name].janga'
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    client: {
      overlay: {
        runtimeErrors: (error) => {
          const ignoreErrors = [
            "ResizeObserver loop limit exceeded",
            "ResizeObserver loop completed with undelivered notifications.",
          ];
          if (ignoreErrors.includes(error.message)) {
            return false;
          }
          return true;
        },
      },
    },
    proxy: {
        "/dataEngine/v3/": {
          target: 'https://surupas-run.native365.net',
          changeOrigin: true,
          secure:false,
          pathRewrite: {'^/dataEngine/v3/': '/dataEngine/v3/'},
          logLevel: 'debug' 
        },
        "/tools/": {
          target: 'https://surupas-run.native365.net'
        },
        "/human_resources/": {
          target: 'https://surupas-run.native365.net'
        }
    }
  },
  chainWebpack: (config) => {
    config.module
    .rule("vue")
    .use("vue-loader")
    .tap((options) => ({
      ...options,
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith("hoge-"),
      },
    }));
  },
  css: {
    extract: {
      filename: `${chunkPrefix}.css`,
      chunkFilename: `${chunkPrefix}.css`,
    },
  },
  configureWebpack: {
    output: {
      filename: `${chunkPrefix}.js`,
      chunkFilename: `${chunkPrefix}.js`,
    }
  },
})
