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

import { pasteHtml, copyHtml } from './common';
import {
    addHotkey,
    addFunctions
} from './summernoteExtend';
import textVersion from 'textVersionjs';

addHotkey({
    'CTRL+SHIFT+D': 'makeTable',
});

function escapeHtml (text) {
    return text.replace(/["&<>]/g, function (a) {
        return {
            '"': '&quot;',
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        }[a];
    });
}

addFunctions({
    makeTable () {
        this.beforeCommand();

        const oldHtml = copyHtml();
        const text = textVersion(oldHtml);
        const lines = text.split('\n').filter(x => x);
        const cells = lines.map(x => x.split('|').map(x => x.trim()));
        const colCount = Math.max.apply(null, cells.map(x => x.length));
        const rowCount = cells.length;

        if (!(rowCount && colCount)) {
            alert('Select some text');
        }
        else {
            const outHtml = [];
            outHtml.push('<table>');
            for (let y = 0 ; y < rowCount ; y++) {
                const row = cells[y];
                while(row.length < colCount) row.push('');
                outHtml.push('<tr>');
                for (let x = 0 ; x < colCount ; x++) {
                    outHtml.push('<td>');
                    outHtml.push(escapeHtml(row[x]));
                    outHtml.push('</td>');
                }
                outHtml.push('</tr>');
            }
            outHtml.push('</table><br>');
            pasteHtml(outHtml.join(''));
        }

        this.afterCommand();
    },
});
