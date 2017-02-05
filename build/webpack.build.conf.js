var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var baseWebpackConfig = require('./webpack.base.conf')

var config = require('./config');

module.exports = webpackMerge(baseWebpackConfig, {
    entry: config.build.entry,
    devtool: '#source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function(module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        })
    ]
});