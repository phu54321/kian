const express = require('express');
const webpack = require('webpack');

module.exports = {
    html: {
        title: 'Kian',
        description: 'Spaced learning app'
    },
    configureWebpack (config, _context) {
        config.externals = {
            jquery: 'jQuery',
            $: 'jQuery'
        };
        config.plugins.push(new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }));
    },
    devServer: {
        after (app) {
            app.use(express.static('backend/testdata/collection.media'));
            app.use(express.static('frontend/public'));
        }
    }
};