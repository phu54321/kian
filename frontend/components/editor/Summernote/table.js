import { pasteHtml, copyHtml } from './common';
import {
    addHotkey,
    addFunctions
} from './summernoteExtend';
const textVersion = require('textversionjs');

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
