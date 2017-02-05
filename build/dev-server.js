var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var hotMiddleware = require('webpack-hot-middleware');
var opn = require('opn');
var webpackConfigDev = require('./webpack.dev.conf');
var config = require('./config');

var app = express();
var compiler = webpack(webpackConfigDev);

app.use(webpackDevMiddleware(compiler));
app.use(hotMiddleware(compiler));

app.listen(config.dev.port, function(error) {
    if (error) {
        console.log(error);
        return;
    }
    var uri = 'http://127.0.0.1:' + config.dev.port;
    console.log('Listening at ' + uri + '\n');
    opn(uri);
});