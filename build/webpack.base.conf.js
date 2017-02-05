var path = require('path');

// 基本配置
module.exports = {
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js'
    },
    resolve: {
        //自动补全后缀，所以在页面引用的时候不用写这些后缀名
        extensions: ['.js', '.json'],
        alias: {
            'src': path.resolve(__dirname, '../src'),
            'test': path.resolve(__dirname, '../src/assets')
        }
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: [path.join(__dirname, '../src'), path.join(__dirname, '../test')]
        }]
    }
};