// webpack.config.js - DEVELOPMENT

var webpack = require('webpack');
var settings = require('./webpack.config.common.js');

settings.devtool = 'cheap-module-source-map',
settings.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('devserver')
  }),
  new webpack.HotModuleReplacementPlugin()
)

settings.devServer = {
  contentBase: './public_html',
  hot: true
}

module.exports = settings;