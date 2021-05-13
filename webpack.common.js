const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

global.paths = {
  demo: {
    src: path.resolve(__dirname, './source/demo'),
    blocks: path.resolve(__dirname, './source/demo/blocks'),
    pages: path.resolve(__dirname, './source/demo/pages'),
    favicons: path.resolve(__dirname, './source/demo/favicons'),
    build: path.resolve(__dirname, './build/demo'),
  },
  plugin: {
    src: path.resolve(__dirname, './source/plugin'),
    build: path.resolve(__dirname, './build/plugin'),
  },
  shared: {
    fonts: path.resolve(__dirname, './source/shared/fonts'),
  },
};
global.pages = fs.readdirSync(global.paths.demo.pages);

module.exports = {
  context: path.resolve(__dirname, './source'),

  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, './source'), 'node_modules'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          {
            loader: 'pug-html-loader',
            options: {
              basedir: global.paths.demo.src,
            },
          },
        ],
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        include: [
          global.paths.shared.fonts,
          /node_modules/,
        ],
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash][ext]'
        },
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/,
        include: [
          global.paths.demo.blocks,
          global.paths.demo.pages,
        ],
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]'
        },
      },
    ],
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
};
