const path = require('path');

module.exports = {
    html: {
        title: 'Kian',
        description: 'Spaced learning app'
    },
    presets: [
        require('poi-preset-eslint')( /* options */ )
    ],
    devServer: {
        proxy: {
            '/media': 'http://localhost:28735'
        }
    }
};