// webpack.config.js - PRODUCTION

var webpack = require('webpack');
var settings = require('./webpack.config.common.js');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

settings.devtool = 'source-map',
settings.module.loaders.push(
{ 
   test: /\.css$/, 
   loader: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader"
           })
},
{ 
   test: /\.scss$/, 
   loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            //resolve-url-loader may be chained before sass-loader if necessary 
            use: ['css-loader', 'sass-loader']
           })
},
{
   test: /\.js$/,
   exclude: /(node_modules|bower_components)/,
   loader: 'babel-loader?cacheDirectory=true',
   query: {
      presets: ['env']
   }
});

settings.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false,
    },
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.IgnorePlugin( /.*(gzip\.js).*/ ), // In production, noParse is ignored.
  new ExtractTextPlugin('css/styles.css')
)

module.exports = settings;