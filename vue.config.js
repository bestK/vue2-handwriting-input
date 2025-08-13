const path = require('path');

module.exports = {
    // 开发环境配置
    ...(process.env.NODE_ENV === 'development'
        ? {
              // 开发环境使用默认配置
          }
        : {
              // 生产环境（库构建）配置
              configureWebpack: {
                  entry: './lib/index.js',
                  output: {
                      library: 'vue2-handwriting-input',
                      libraryTarget: 'umd',
                      umdNamedDefine: true,
                  },
                  externals: {
                      vue: {
                          root: 'Vue',
                          commonjs: 'vue',
                          commonjs2: 'vue',
                          amd: 'vue',
                      },
                  },
              },
              css: {
                  extract: false, // 不单独提取CSS，打包到JS中
              },
          }),
};
