const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  target: 'browserslist',

  entry: {
    'al-range-slider': './plugin/plugin.ts',
  },

  output: {
    filename: 'js/[name].js',
    path: global.paths.plugin.build,
    clean: true,
  },

  externals: {
    jquery: 'jQuery',
  },

  optimization: {
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
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
});
