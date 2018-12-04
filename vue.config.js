// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see "http://www.gnu.org/licenses/".

const express = require('express')

module.exports = {
  configureWebpack: {
    externals: {
      jquery: 'jQuery',
      $: 'jQuery'
    }
  },
  devServer: {
    before (app) {
      const addonStaticServe = require('./src/helpers/addons/staticServe')
      app.use(express.static('backend/testdata/collection.media', { maxAge: '30d' }))
      addonStaticServe(app)
    }
  },
  pluginOptions: {
    karma: {
      karmaConfig: {
        colors: true,
        browsers: ['ChromeHeadless']
      }
    }
  }
}
