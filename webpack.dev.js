const { merge } = require('webpack-merge');
const HtmlPlugin = require('html-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  target: 'web',

  entry: {
    demo: './demo/index.ts',
  },

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },

  plugins: [
    ...global.pages.filter((page) => !/layout/i.test(page))
    .map((page) => new HtmlPlugin({
      template: `${global.paths.demo.pages}/${page}/${page}.pug`,
      filename: `${page}.html`,
    })),
  ],
});
