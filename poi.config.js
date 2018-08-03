const webpack = require('webpack');
const express = require('express');

module.exports = {
    html: {
        title: 'Kian',
        description: 'Spaced learning app'
    },
    presets: [
        require('poi-preset-eslint')( /* options */ )
    ],
    configureWebpack (config, _context) {
        config.externals = {
            jquery: 'jQuery',
            $: 'jQuery'
        };
    },
    devServer: {
        after (app) {
            app.use(express.static('backend/testdata/collection.media'));
        }
    }
};