// webpack.config.js - DEVELOPMENT

var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    path.join(__dirname, 'src', 'entry.js')
  ],
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
      	loader: 'url-loader?limit=8192&name=images/[hash].[ext]' // inline base64 URLs for <=8k images, direct URLs for the rest
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[hash].[ext]'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=fonts/[hash].[ext]'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader?name=fonts/[hash].[ext]'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=fonts/[hash].[ext]'
      }
    ],
    noParse: [ /.*(gzip\.js).*/ ]  // TarGZ doesn't play well with webpack, so skip parsing
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
  	new HtmlWebpackPlugin(
  		{
  			template: 'src/html/index.html',
  			inject: 'head',
  			title: 'OSweb 2.0'
  		}
  	),
  ],
};