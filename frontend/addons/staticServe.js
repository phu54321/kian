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
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


// This file is intented to be run inside poi.config.js, so it uses path module
// to get all modules.

module.exports = function (app) {
    const path = require('path');
    const fs = require('fs');
    const express = require('express');
    const addonListDir = path.resolve(__dirname, '../../addons');

    fs.readdirSync(addonListDir).forEach(addonName => {
        if(addonName.startsWith('.')) return;

        const addonDir = path.join(addonListDir, addonName);
        const { staticFiles } = require(path.join(addonDir, 'addonConfig.js'));
        if(!staticFiles) return;

        for(const {src, servePath} of staticFiles) {
            const staticPath = path.join(addonDir, src);
            app.use(servePath, express.static(staticPath));
        }
    });
};

