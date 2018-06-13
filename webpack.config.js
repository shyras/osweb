// webpack.config.js - Common settings
const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const pkgconfig = require('./package.json')

module.exports = (env, args) => ({
  devtool: args.mode === 'production' ? 'source-map' : 'cheap-module-source-map',
  entry: {
    osweb: ['@babel/polyfill', path.join(__dirname, 'src', 'entry.js')],
    vendor: [
      'filbert', 'lodash', 'pixi.js', 'pixi-sound', 'random-seed', 'webfontloader',
      'bootstrap', 'alertifyjs', 'pako'
    ]
  },
  output: {
    path: path.join(__dirname, 'public_html'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js'
  },
  module: {
    rules: [{
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }]
    },
    {
      test: /\.(js|ts)$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['@babel/preset-env']
        }
      }
    },
    {
      test: /\.scss$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: function () { // post css plugins, can be exported to postcss.config.js
              return [
                require('precss'),
                require('autoprefixer')
              ]
            }
          }
        },
        'sass-loader'
      ]
    }, {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader']
    }, {
      test: /\.(png|jpg)$/,
      use: 'url-loader?limit=8192&name=images/[hash].[ext]' // inline base64 URLs for <=8k images, direct URLs for the rest
    }, {
      test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      use: 'url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[hash].[ext]'
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      use: 'url-loader?limit=10000&mimetype=application/octet-stream&name=fonts/[hash].[ext]'
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      use: 'file-loader?name=fonts/[hash].[ext]'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: 'url-loader?limit=10000&mimetype=image/svg+xml&name=fonts/[hash].[ext]'
    }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: pkgconfig.name + ' ' + pkgconfig.version,
      template: 'src/html/index.ejs',
      inject: 'head',
      favicon: './src/img/osdoc.png'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css'
    }),
    new webpack.NamedModulesPlugin(),
    new CopyWebpackPlugin([{
      from: 'example-experiments/*.osexp',
      to: 'osexp/',
      flatten: true
    }], {
      debug: 'info'
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: 'vendor',
          enforce: true
        }
      }
    }
  }
})
