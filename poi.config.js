const express = require('express');
const path = require('path');
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin');
const webpack = require('webpack');

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
        config.node = {
            fs: 'empty'
        };
        config.plugins.push(new VueAutoRoutingPlugin({
            pages: 'frontend/pages',
            importPrefix: '@/pages/'
        }));
        config.plugins.push(new webpack.DefinePlugin({
            'process.browser': 'true'
        }));
    },
    devServer: {
        after (app) {
            app.use(express.static('backend/testdata/collection.media'));
            app.use(express.static('frontend/public'));
        }
    }
};