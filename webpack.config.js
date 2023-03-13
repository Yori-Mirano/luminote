const path = require('path');
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'production',

  //devtool: 'source-map',

  entry: './src/app.ts',

  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    clean: true,
  },

  devServer: {
    static: './dist',
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/app.html',
      filename: "luminote.html",
      cache: false
    }),
    new InlineSourceWebpackPlugin({
      compress: true,
      rootpath: './src',
      noAssetMatch: 'warn'
    })
  ]
};
