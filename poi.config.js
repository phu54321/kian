const express = require('express');
const path = require('path');
const VueAutoRoutingPlugin = require('vue-auto-routing/lib/webpack-plugin');
const webpack = require('webpack');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');



module.exports = {
    outDir: 'dist/frontend',
    staticFolder: 'public',
    plugins: [
        require('@poi/plugin-eslint')({
            command: '*',
            loaderOptions: {
                configFile: 'dev.eslintrc.js',
            },
        }),
        require('@poi/plugin-typescript')(),
    ],
    html: {
        title: 'Kian',
        description: 'Spaced learning app',
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
            fs: 'empty',
        };
        config.plugins.push(
            new VueAutoRoutingPlugin({
                pages: 'frontend/pages',
                importPrefix: '@/pages/',
            }),
            new webpack.DefinePlugin({
                'process.browser': 'true',
            }),
            // new BundleAnalyzerPlugin()
        );
    },
    devServer: {
        after (app) {
            const addonStaticServe = require('./frontend/addons/staticServe');
            app.use(express.static(',ckend/testdata/collection.media', { maxAge: '30d' }));
            app.use(express.static('frontend/public'));
            addonStaticServe(app);
        },
    },
};
