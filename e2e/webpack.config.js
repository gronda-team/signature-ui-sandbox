const path = require('path');
const reactConfig = require('./webpack.config.js');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    contentBase: ['./dist', path.resolve(__dirname, '../assets')],
    port: '3000',
    publicPath: '/',
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: reactConfig,
        },
      }
    ],
  },
};
