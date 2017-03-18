// webpack.config.js - DEVELOPMENT

var webpack = require('webpack');
var settings = require('./webpack.config.common.js');

settings.devtool = 'cheap-module-source-map';
settings.module.loaders.push(
	{
		test: /\.scss$/,
		loaders: 'style-loader!css-loader!sass-loader'
	},
	{
		test: /\.css$/, 
		loader: 'style-loader!css-loader' 
	}
);

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