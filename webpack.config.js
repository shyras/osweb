// webpack.config.js - Common settings
const webpack = require('webpack')

const path = require('path')
const fs = require('fs')
const startCase = require('lodash').startCase
// Webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const pkgconfig = require('./package.json')

const outputPath = path.join(__dirname, 'public_html')
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
  // Check if devserver is running
  console.info('Current mode:', args.mode)

  let outputName
  if (args.mode === 'development') {
    outputName = '[name].[chunkhash].bundle'
  } else {
    outputName = `[name].${pkgconfig.version}.bundle`
  }

  const config = {
    mode: args.mode || 'development',
    devtool: args.mode === 'development' ? 'cheap-module-source-map' : 'source-map',
    entry: {
      osweb: [path.join(__dirname, 'src', 'app.js')],
      extra: [path.join(__dirname, 'src', 'extra.js')]
    },
    output: {
      path: outputPath,
      filename: `js/${outputName}.js`
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
            plugins: ['lodash'],
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
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'images/[hash].[ext]'
          }
        }]
      }, {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'fonts/[hash].[ext]',
            mimetype: 'application/font-woff'
          }
        }]
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'fonts/[hash].[ext]',
            mimetype: 'application/octet-stream'
          }
        }]
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader?name=fonts/[hash].[ext]'
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'vector/[hash].[ext]',
            mimetype: 'image/svg+xml'
          }
        }]
      }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'OSWEB_VERSION_NAME': JSON.stringify(pkgconfig.name),
        'OSWEB_VERSION_NO': JSON.stringify(pkgconfig.version)
      }),
      new webpack.NamedModulesPlugin(),
      new MiniCssExtractPlugin({
        filename: `css/${outputName}.css`
      }),
      new CopyWebpackPlugin([{
        from: 'example-experiments/*.osexp',
        to: exampleFolder,
        flatten: true
      },
      {
        from: 'src/img/*',
        to: 'img',
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
      // new LodashModuleReplacementPlugin({
      //   'shorthands': true,
      //   'collections': true,
      //   'paths': true
      // })
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

  // config.serve = {
  //   add: (app, middleware, options) => {
  //     // Be sure to pass the options argument from the arguments
  //     app.use(webpackServeWaitpage(options, {
  //       title: 'OpenSesame Web',
  //       theme: 'material'
  //     }))
  //   }
  // }

  return config
}
