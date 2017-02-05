var path = require('path');

module.exports = {
    dev: {
        port: 8080,
        template: 'test/index.html',
        entry: {
            flowchart: ['./test/flowchart.js', './build/dev-client.js']
        }
    },
    build: {
        entry: {
            flowchart: './src/chart.js'
        }
    }
}