// webpack.config.js - DEVELOPMENT
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var settings = require('./webpack.config.common.js');

settings.devtool = 'cheap-module-source-map';
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
}
);

settings.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  }),
  new ExtractTextPlugin('css/styles.css')
)

module.exports = settings;
