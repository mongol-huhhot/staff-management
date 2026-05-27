
const { defineConfig } = require('@vue/cli-service')
const { String } = require('core-js')
const chunkPrefix = '[name].janga'
// const PROXY = 'https://surupas-stg.native365.net'
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
      .rule('images')
      .use('url-loader')
      .tap(options => Object.assign({}, options, { name: `${chunkPrefix}.[ext]` }));
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
