const { merge } = require('webpack-merge');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  target: 'browserslist',

  entry: {
    demo: './demo/index.ts',
  },

  output: {
    filename: 'js/[name].[contenthash].js',
    path: global.paths.demo.build,
    clean: true,
  },

  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        plugin: {
          test: /[\\/]source[\\/]plugin[\\/]/,
          name: 'plugin',
          chunks: 'all',
        },
      },
    },
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
          },
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
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    // new CopyPlugin({
    //   patterns: [
    //     { from: paths.demo.favicons, to: 'assets/favicons/' },
    //   ],
    // }),
  ],
});
