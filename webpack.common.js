const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const PATHS = {
  plugin: {
    src: path.resolve(__dirname, './source/plugin'),
  },
  demo: {
    src: path.resolve(__dirname, './source/demo'),
    pages: path.resolve(__dirname, './source/demo/pages'),
  },
  fonts: path.resolve(__dirname, './source/shared/fonts'),
  build: path.resolve(__dirname, './build'),
  // scripts: path.resolve(__dirname, './source/scripts'),
  // styles: path.resolve(__dirname, './source/styles'),
  // favicons: path.resolve(__dirname, './source/favicons'),
  // blocks: path.resolve(__dirname, './source/blocks'),
};
const PAGES = fs.readdirSync(PATHS.demo.pages);

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // node_modules: path.resolve(__dirname, './node_modules'),
      // scripts: PATHS.scripts,
      // styles: PATHS.styles,
      // blocks: PATHS.blocks,
    },
  },

  entry: {
    main: `${PATHS.demo.src}/index.ts`,
  },

  output: {
    filename: 'js/[name].[contentHash].js',
    path: PATHS.build,
  },

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          'pug-html-loader',
        ],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(woff2?|ttf|eot|svg)$/,
        include: [
          PATHS.fonts,
          /node_modules/,
        ],
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[contentHash].[ext]',
            outputPath: 'assets/fonts/',
          },
        },
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/,
        include: [
          // PATHS.blocks,
          PATHS.demo.pages,
        ],
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[contentHash].[ext]',
            outputPath: 'assets/images/',
          },
        },
      },
    ],
  },

  plugins: [
    ...PAGES.filter((page) => !/layout/i.test(page))
      .map((page) => new HtmlWebpackPlugin({
        template: `${PATHS.demo.pages}/${page}/${page}.pug`,
        filename: `${page}.html`,
      })),
    // new CopyPlugin({
    //   patterns: [
    //     { from: PATHS.favicons, to: 'assets/favicons/' },
    //   ],
    // }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
};
