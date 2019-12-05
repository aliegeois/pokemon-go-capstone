const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const cleanPlugin = new CleanWebpackPlugin(['dist']);
module.exports = (env, argv) => {
	return {
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					commons: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all'
					}
				}
			},
			nodeEnv: argv.mode
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader'
					}
				}, {
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		},
		plugins: [new HtmlWebPackPlugin({
			template: './src/index.html',
			filename: './index.html'
		}), cleanPlugin],
		output: {
			filename: '[name].[hash].js',
			path: path.resolve(__dirname, 'dist')
		}
	};
};
