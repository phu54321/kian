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

import { addHook } from './../hookBase';

function stripClozeHelper (html) {
    return html.replace(new RegExp(
        '</?(cz_hide|cloze2|cloze2_w)>|' +
        '<(cloze2_w|cloze2) class=(\\"|\')cz-\\d+(\\"|\')>|' +
        '<script( class=(\\"|\')cz-\\d+(\\"|\'))?>_czha\\(\\d+\\)</script>'
    ), '');
}

const _voidElements = new Set([
    'area', 'base', 'basefont', 'bgsound', 'br', 'col',
    'command', 'embed', 'frame', 'hr', 'image', 'img', 'input', 'isindex',
    'keygen', 'link', 'menuitem', 'meta', 'nextid', 'param', 'source',
    'track', 'wbr'
]);

function wrapClozeTag (s, clozeId) {
    const PARSE_DATA = 0;
    const PARSE_TAG = 1;
    let mode = PARSE_DATA;

    const output = [`<cloze2_w class='cz-${clozeId}'></cloze2_w>`];
    const dataCh = [];
    const tagCh = [];

    const cloze_header = `<cloze2 class='cz-${clozeId}'>`;
    const cloze_footer = '</cloze2>';

    let chunks = [];

    function emitData () {
        const data = dataCh.join('');
        dataCh.length = 0;

        if(!data) return;
        chunks.push(['data', data]);
    }

    function emitTag () {
        const tag = tagCh.join('');
        tagCh.length = 0;

        const tagStartMatch = tag.match(/<\s*([a-zA-Z0-9]+)/);
        const tagEndMatch = tag.match(/<\s*\/\s*([a-zA-Z0-9]+)/);

        if (tagStartMatch) {
            // Void tags are treated as data
            if (!_voidElements.has(tagStartMatch[1].toLowerCase())) {
                chunks.push(['data', tag]);
            }
            else {
                chunks.push(['tstart', tag]);
            }
        }

        else if(tagEndMatch) {
            chunks.push(['tend', tag]);
        }
    }

    for(let i = 0 ; i < s.length ; i++) {
        const ch = s[i];
        if(mode === PARSE_DATA) {
            if(ch === '<') {
                mode = PARSE_TAG;
                emitData();
                tagCh.push('<');
            }
            else dataCh.push(ch);
        }
        else {
            tagCh.push(ch);
            if(ch === '>') {
                mode = PARSE_DATA;
                emitTag();
            }
        }
    }

    if(mode === PARSE_DATA) emitData();
    else emitTag();

    while(true) {
        let hasReduction = false;
        if(chunks.length >= 3) {
            let i = 2;
            const newChunks = [];
            while(i < chunks.length) {
                if (
                    chunks[i - 2][0] === 'tstart' &&
                    chunks[i - 1][0] === 'data' &&
                    chunks[i - 0][0] === 'tend'
                ) {
                    newChunks.push([
                        'data',
                        chunks[i - 2][1] + chunks[i - 1][1] + chunks[i][1]
                    ]);
                    hasReduction = true;
                    i += 3;
                }
                else {
                    newChunks.push(chunks[i - 2]);
                    i++;
                }
            }
            newChunks.push(...chunks.slice(i - 2));
            chunks = newChunks;
        }

        if(!hasReduction) break;
    }

    output.push(...chunks.map(
        x => x[0] === 'data' ? cloze_header + x[1] + cloze_footer : x[1]
    ));
    return output.join('');
}


function makeClozeCompatiable (html) {
    html = html.replace(
        /\{\{c(\d+)::([^!]([^:}]|:[^:}])*?)\}\}/g,
        (...match) => `{{c${match[1]}::${wrapClozeTag(match[2], match[1] | 0)}}}`
    );
    html = html.replace(
        /\{\{c(\d+)::([^!]([^:}]|:[^:}])*?)::(([^:}]|:[^:}])*?)\}\}/g,
        (...match) => `{{c${match[1]}}::${wrapClozeTag(match[2], match[1] | 0)}::${match[4]}}}`
    );
    html = html.replace(
        /\{\{c(\d+)::!/g,
        (...match) => `{{c${match[1]}::<cz_hide>!</cz_hide>`
    );
    return html;
}

addHook('edit_note', msg => {
    const {model, fields} = msg;
    if(model === 'Cloze (Hide all)') {
        msg.fields = fields.map(
            field => makeClozeCompatiable(stripClozeHelper(field))
        );
    }
    return msg;
});
