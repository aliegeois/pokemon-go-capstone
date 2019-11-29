const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
	template: './src/index.html',
	filename: './index.html'
});

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
		plugins: [htmlPlugin, cleanPlugin],
		output: {
			filename: '[name].[hash].js',
			path: path.resolve(__dirname, 'dist')
		},
		resolve: {
			alias: {/*
        config: path.resolve(__dirname, 'config/'),
        services: path.resolve(__dirname, 'src/services/'),
        screens: path.resolve(__dirname, 'src/screens/'),
        shared: path.resolve(__dirname, 'src/shared/')
	  */}
		}
	};
};
