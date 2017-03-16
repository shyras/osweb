// webpack.config.js - DEVELOPMENT

/* Uncomment code below again once hjs-webpack works with webpack 2 again */

// var getConfig = require('hjs-webpack')

// module.exports = getConfig({
//   // entry point for the app
//   in: './src/js/osweb/index.js',

//   // Name or full path of output directory
//   // commonly named `www` or `public`. This
//   // is where your fully static site should
//   // end up for simple deployment.
//   out: './public_html/',

//   // This will destroy and re-create your
//   // `out` folder before building so you always
//   // get a fresh folder. Usually you want this
//   // but since it's destructive we make it
//   // false by default
//   clearBeforeBuild: true
// })

var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var path = require('path')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    './src/js/osweb/index.js'
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
      },
      // {
      //   test: /\.html$/,
      //   loader: "raw-loader"
      // }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('devserver')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  	new HtmlWebpackPlugin(
  		{
  			template: 'src/html/index.html',
  			inject: 'head',
  			title: 'OSweb 2.0'
  		}
  	),
  ],
  devServer: {
    contentBase: './public_html',
    hot: true
  }
};