const path = require('path')

module.exports = {
  // 修改 pages 入口
  pages: {
    index: {
      entry: 'src/main.js', // 开发环境入口
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  // 扩展 webpack 配置
  configureWebpack: {
    // 提供插件的入口
    entry: process.env.NODE_ENV === 'development' ? './src/main.js' : './lib/index.js',
    output: {
      // 库的名字
      library: 'vue2-handwriting-input',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    externals: process.env.NODE_ENV === 'production' ? {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue'
      }
    } : {}
  },
  css: {
    extract: false // 不单独提取CSS，打包到JS中
  }
}