var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var baseWebpackConfig = require('./webpack.base.conf')
var config = require('./config');

module.exports = webpackMerge(baseWebpackConfig, {
    entry: config.dev.entry,
    devtool: '#eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: config.dev.template,
            inject: true
        }),
        // 热更新
        new webpack.HotModuleReplacementPlugin(),
        // 热更新错误提示
        new webpack.NoEmitOnErrorsPlugin()
    ]
});