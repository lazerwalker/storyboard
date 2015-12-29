var path = require('path');
var webpack = require('webpack');
 
module.exports = {
  entry: [
    'babel-polyfill',
    './src/runner.js',
  ],
  include: [ path.resolve(__dirname, "src") ],
  output: { path: path.resolve(__dirname, "dist"), filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        query: {
          // TODO: right now, there's a Babel 6.X bug that breaks this. Try uncommenting this out in a while.
          // plugins: ['transform-runtime'],
          presets: ['es2015'],
        }
      }
    ]
  },
};