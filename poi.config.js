const express = require('express');
const path = require('path');
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin');
const webpack = require('webpack');

module.exports = {
    outDir: 'dist/frontend',
    staticFolder: 'public',
    plugins: [
        require('@poi/plugin-eslint')(),
    ],
    html: {
        title: 'Kian',
        description: 'Spaced learning app'
    },
    restartOnFileChanges: [
        'frontend/addons/staticServe.js',
        'poi.config.js',
    ],
    configureWebpack (config) {
        config.externals = {
            jquery: 'jQuery',
            $: 'jQuery',
        };
        config.resolve = {
            extensions: ['.js', '.ts', '.vue', '.json'],
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
            const addonStaticServe = require('./frontend/addons/staticServe');
            app.use(express.static('backend/testdata/collection.media'));
            app.use(express.static('frontend/public'));
            addonStaticServe(app);
        }
    }
};
