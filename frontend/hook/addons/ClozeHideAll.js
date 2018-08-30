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
import { tokHtml } from './../../utils/tokHtml';

const modelName = 'Cloze (Hide all)';

function stripClozeHelper (html) {
    return (html
        .replace(/<\/?(cz_hide|cloze2|cloze2_w)>/g, '')
        .replace(/<(cloze2_w|cloze2) class=("|')cz-\d+("|')>/g, '')
        .replace(/<script( class=("|')cz-\\d+("|'))?>_czha\(\d+\)<\/script>/g, '')
    );
}


function wrapClozeTag (s, clozeId) {
    const output = [`<cloze2_w class='cz-${clozeId}'></cloze2_w>`];
    const cloze_header = `<cloze2 class='cz-${clozeId}'>`;
    const cloze_footer = '</cloze2>';

    let chunks = tokHtml(s);

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


addHook('edit_card_load', card => {
    const {model, fields} = card;
    if(model === modelName) {
        card.fields = fields.map(stripClozeHelper);
    }
    return card;
});

addHook('edit_card_save', card => {
    const {model, fields} = card;
    if(model === modelName) {
        card.fields = fields.map(
            field => makeClozeCompatiable(stripClozeHelper(field))
        );
    }
    return card;
});
