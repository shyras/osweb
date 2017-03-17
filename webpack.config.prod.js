// webpack.config.js - PRODUCTION

var webpack = require('webpack');
var settings = require('./webpack.config.common.js');

settings.devtool = 'source-map',
settings.module.loaders.push(
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
  new webpack.IgnorePlugin( /.*(gzip\.js).*/ ) // In production, noParse is ignored.
)

module.exports = settings;