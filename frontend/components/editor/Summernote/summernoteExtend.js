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

import $ from 'jquery';

const Editor = $.summernote.options.modules.editor;

export function addHotkey (keyMap) {
    const macKeyMap = Object.assign({}, keyMap);
    Object.keys(macKeyMap).forEach(key => {
        if (key.startsWith('CTRL+')) {
            const newKey = 'CMD+' + key.substr(5);
            macKeyMap[newKey] = macKeyMap[key];
            macKeyMap[key] = undefined;
        }
    });

    $.extend(true, $.summernote.options.keyMap, {
        pc: keyMap,
        mac: macKeyMap,
    });
}

export function removeHotkey (hotkeyList) {
    const keyMap = $.summernote.options.keyMap;
    hotkeyList.forEach(key => {
        const macKey = (key.startsWith('CTRL+')) ? 'CMD+' + key.substr(5) : key;
        delete keyMap.pc[key];
        delete keyMap.mac[macKey];
    });
}

export function addFunctions (functions) {
    $.extend(true, Editor.prototype, functions);
}
