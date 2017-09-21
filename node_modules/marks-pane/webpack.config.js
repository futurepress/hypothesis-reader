var webpack = require("webpack");
var path = require('path');
var PROD = (process.env.NODE_ENV === 'production')
var hostname = "localhost";
var port = 8080;

module.exports = {
	entry: "./src/marks.js",
	devtool: false,
	output: {
		path: path.resolve("./pkg"),
		filename: "marks.js",
		sourceMapFilename: "marks.js.map",
		library: "marks",
		libraryTarget: "umd",
		publicPath: "/pkg/"
	},
	externals: {
	},
	plugins: PROD ? [
		new BabiliPlugin()
	] : [],
	resolve: {
		alias: {
			path: "path-webpack"
		}
	},
	devServer: {
		host: hostname,
		port: port,
		inline: true
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					presets: ['es2015']
				}
			}
		]
	}
}
