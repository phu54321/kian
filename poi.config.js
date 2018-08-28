const express = require('express');

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
    },
    devServer: {
        after (app) {
            app.use(express.static('backend/testdata/collection.media'));
            app.use(express.static('frontend/public'));
        }
    }
};