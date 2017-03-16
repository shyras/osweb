// webpack.config.js - PRODUCTION


var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: [ './src/js/osweb/index.js' ],
  output: {
  	path: path.join(__dirname, 'public_html'),
    filename: 'js/osweb.js'       
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loaders: 'style-loader!css-loader!sass-loader'
      },
      {
      	test: /\.css$/, 
      	loader: 'style-loader!css-loader' 
      },
      { 
      	test: /\.(png|jpg)$/, 
      	loader: 'url-loader?limit=8192' // inline base64 URLs for <=8k images, direct URLs for the rest
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      },
      { 
      	test: /\.js$/,
      	exclude: /(node_modules|bower_components)/,
      	loader: 'babel-loader?cacheDirectory=true',
      	query: {
        	presets: ['env']
      	}
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    }),
  	new HtmlWebpackPlugin(
  		{
  			template: 'src/html/index.html',
  			inject: 'head',
  			title: 'OSweb 2.0'
  		}
  	),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
};