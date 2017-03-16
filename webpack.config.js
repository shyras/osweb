// webpack.config.js

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

module.exports = {

  entry: './src/js/osweb/index.js',
  output: {
  	path: './public_html/',
    filename: 'js/osweb.js'       
  },
  module: {
    loaders: [
      { 
      	test: /\.scss$/, 
      	loader: 'style-loader!css-loader!scss-loader' 
      },{
      	test: /\.css$/, 
      	loader: 'style-loader!css-loader' 
      },{ 
      	test: /\.(png|jpg)$/, 
      	loader: 'url-loader?limit=8192' // inline base64 URLs for <=8k images, direct URLs for the rest
      },
      // ,{ 
      // 	test: /\.js$/,
      // 	exclude: /(node_modules|bower_components)/,
      // 	loader: 'babel-loader?cacheDirectory=true',
      // 	query: {
      //   	presets: ['env']
      // 	}
      // }
    ]
  },
  plugins: [
  	new HtmlWebpackPlugin(
  		{
  			template: '!!handlebars-loader!src/html/index.hbs',
  			inject: 'head',
  			title: 'OSweb 2.0'
  		}
  	)
  ]
};