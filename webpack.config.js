// webpack.config.js - Common settings
const webpack = require('webpack')
const webpackServeWaitpage = require('webpack-serve-waitpage')

const path = require('path')
const fs = require('fs')
const startCase = require('lodash').startCase

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const pkgconfig = require('./package.json')

// Check if devserver is running
const isDevServer = process.env.WEBPACK_SERVE || false // require.main.filename.includes('webpack-dev-server')

// Folder to which example experiments are copied
const exampleFolder = 'osexp'

// A list of experiments that are found in example-experiments
// With this list, the dropdown of example experiments is populated on the demo page
const exampleExperiments = fs.readdirSync('example-experiments')
  .filter(filename => /\.osexp$/i.test(filename))
  .map(item => ({
    file: path.join(exampleFolder, item),
    title: startCase(item.substr(0, item.lastIndexOf('.')))
  }))

module.exports = (env, args) => {
  const config = {
    mode: isDevServer ? 'development' : args.mode,
    devtool: (isDevServer || args.mode === 'development') ? 'cheap-module-source-map' : 'source-map',
    entry: {
      osweb: ['@babel/polyfill', path.join(__dirname, 'src', 'app.js')]
    },
    output: {
      path: path.join(__dirname, 'public_html'),
      filename: 'js/' + (isDevServer ? '[name].bundle.js' : '[name].[chunkhash].bundle.js')
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
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
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDevServer ? 'development' : args.mode)
      }),
      new webpack.NamedModulesPlugin(),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: 'css/[id].css'
      }),
      new CopyWebpackPlugin([{
        from: 'example-experiments/*.osexp',
        to: exampleFolder,
        flatten: true
      }], {
        debug: 'info'
      }),
      new HtmlWebpackPlugin({
        title: pkgconfig.name + ' ' + pkgconfig.version,
        template: 'src/html/index.ejs',
        inject: 'head',
        favicon: './src/img/osdoc.png',
        filename: 'index.html',
        exampleExperiments
      })
    ],
    optimization: {
      sideEffects: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          }
        }
      },
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            keep_fnames: true
          }
        })
      ]
    }
  }

  config.serve = {
    add: (app, middleware, options) => {
      // Be sure to pass the options argument from the arguments
      app.use(webpackServeWaitpage(options, {
        title: 'OpenSesame Web',
        theme: 'material'
      }))

      // Make sure the usage of webpack-serve-waitpage will be before the following commands if exists
      // middleware.webpack();
      // middleware.content();
    }
  }

  return config
}
