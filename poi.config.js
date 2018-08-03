const webpack = require('webpack');

module.exports = {
    html: {
        title: 'Kian',
        description: 'Spaced learning app'
    },
    presets: [
        require('poi-preset-eslint')( /* options */ )
    ],
    configureWebpack (config, _context) {
        // Do something like adding a plugin
        config.plugins.push(new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            summernote: 'summernote',
        }));
        config.externals = {
            jquery: 'jQuery',
            $: 'jQuery'
        };
        // optionally return config
    },
    devServer: {
        proxy: {
            '/media': 'http://localhost:28735'
        }
    }
};