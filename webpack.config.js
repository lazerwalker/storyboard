const path = require('path');

module.exports = {
  entry: './src/game.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: "storyboard",
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  node: {
    crypto: 'empty'
  }
};