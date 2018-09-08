const express = require('express');
const path = require('path');
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin');

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
        config.plugins.push(new VueAutoRoutingPlugin({
            // Path to the directory that contains your page components.
            pages: 'frontend/pages',

            // A string that will be added to importing component path (default @/pages/).
            importPrefix: '@/pages/'
        }));
    },
    devServer: {
        after (app) {
            app.use(express.static('backend/testdata/collection.media'));
            app.use(express.static('frontend/public'));
        }
    }
};