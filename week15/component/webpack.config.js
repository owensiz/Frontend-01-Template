const path = require('path');

module.exports = {
  entry: './main.js',
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   filename: 'bundle.js'
  // }
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [["@babel/plugin-transform-react-jsx",{pragma:"create"}]]

          }
        }
      },
      {
        test: /\.mockVue/,
        use: { 
          loader: require.resolve("./myloader.js")
        }
        
      },
    ]
  },
  // 下面两个配置，是为了在打包那边，看到可读的格式化的代码,
  mode: 'development',
  optimization: {
    minimize: false
  }
};