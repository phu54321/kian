const express = require('express');
const path = require('path');

module.exports = {
    outDir: 'dist/frontend',
    staticFolder: 'frontend/public',
    html: {
        title: 'Kian',
        description: 'Spaced learning app'
    },
    configureWebpack (config, _context) {
        config.externals = {
            jquery: 'jQuery',
            $: 'jQuery',
        };
        config.resolve = {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                '@': path.resolve(__dirname, 'frontend/'),
                '~': path.resolve(__dirname, 'frontend/'),
            },
        };
    },
    devServer: {
        after (app) {
            app.use(express.static('backend/testdata/collection.media'));
            app.use(express.static('frontend/public'));
        }
    }
};