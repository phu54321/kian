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

const voidElements = new Set([
    'area', 'base', 'basefont', 'bgsound', 'br', 'col',
    'command', 'embed', 'frame', 'hr', 'image', 'img', 'input', 'isindex',
    'keygen', 'link', 'menuitem', 'meta', 'nextid', 'param', 'source',
    'track', 'wbr',
]);

export function tokHtml (html: string) {
    const PARSE_DATA = 0;
    const PARSE_TAG = 1;
    let mode = PARSE_DATA;

    const dataCh: string[] = [];
    const tagCh: string[] = [];

    const chunks: string[][] = [];

    function emitData () {
        const data = dataCh.join('');
        dataCh.length = 0;

        if (!data) return;
        chunks.push(['data', data]);
    }

    function emitTag () {
        const tag = tagCh.join('');
        tagCh.length = 0;

        const tagStartMatch = tag.match(/<\s*([a-zA-Z0-9]+)/);
        const tagEndMatch = tag.match(/<\s*\/\s*([a-zA-Z0-9]+)/);

        if (tagStartMatch) {
            // Void tags are treated as data
            if (!voidElements.has(tagStartMatch[1].toLowerCase())) {
                chunks.push(['data', tag]);
            } else {
                chunks.push(['tstart', tag, tagStartMatch[1].toLowerCase()]);
            }
        } else if (tagEndMatch) {
            chunks.push(['tend', tag, tagEndMatch[1].toLowerCase()]);
        }
    }

    for (const ch of html) {
        if (mode === PARSE_DATA) {
            if (ch === '<') {
                mode = PARSE_TAG;
                emitData();
                tagCh.push('<');
            } else dataCh.push(ch);
        } else {
            tagCh.push(ch);
            if (ch === '>') {
                mode = PARSE_DATA;
                emitTag();
            }
        }
    }

    if (mode === PARSE_DATA) emitData();
    else emitTag();

    return chunks;
}
