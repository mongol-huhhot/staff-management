
const { defineConfig } = require('@vue/cli-service')
const { String } = require('core-js')
const chunkPrefix = '[name].janga'
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    proxy: {
      "/dataEngine/v1/": {
        target: 'https://surupas-dev.native365.net'
      },
      "/tools/": {
        target: 'https://surupas-dev.native365.net'
      },
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
