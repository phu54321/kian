import $ from 'jquery';
import { wrap } from './common';

function getLastClozeId (code) {
    let maxClozeId = 0;
    code.replace(/\{\{c(\d+)::/g, (match, g1) => {
        const clozeId = parseInt(g1);
        if (maxClozeId < clozeId) maxClozeId = clozeId;
    });
    return maxClozeId;
}

export function newClozeBtn (context) {
    const ui = $.summernote.ui;
    // create button
    const button = ui.button({
        contents: '[..]',
        tooltip: 'Cloze',
        click: function () {
            // invoke insertText method with 'hello' on editor module.
            const code = context.invoke('code');
            const lastClozeId = getLastClozeId(code);
            const thisClozeId = lastClozeId + 1;
            context.invoke('beforeCommand');
            wrap(`{{c${thisClozeId}::`, '}}');
            context.invoke('afterCommand');
        }
    });

    return button.render();
}

export function sameClozeBtn (context) {
    const ui = $.summernote.ui;
    // create button
    const button = ui.button({
        contents: '[==]',
        tooltip: 'Cloze (same)',
        click: function () {
            // invoke insertText method with 'hello' on editor module.
            const code = context.invoke('code');
            const lastClozeId = getLastClozeId(code);
            const thisClozeId = lastClozeId || 1;
            context.invoke('beforeCommand');
            wrap(`{{c${thisClozeId}::`, '}}');
            context.invoke('afterCommand');
        }
    });

    return button.render();
}