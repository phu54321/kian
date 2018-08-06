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

$.extend(true, $.summernote.options.keyMap, {
    pc: {
        'CTRL+SHIFT+C': 'newCloze',
        'CTRL+SHIFT+F': 'sameCloze',
    },
    mac: {
        'CMD+SHIFT+C': 'newCloze',
        'CMD+SHIFT+F': 'sameCloze',
    }
});

const Editor = $.summernote.options.modules.editor;

Editor.prototype.newCloze = function () {
    const code = this.context.invoke('code');
    const lastClozeId = getLastClozeId(code);
    const thisClozeId = lastClozeId + 1;
    this.beforeCommand();
    wrap(`{{c${thisClozeId}::`, '}}');
    this.afterCommand();
};

Editor.prototype.sameCloze = function () {
    const code = this.context.invoke('code');
    const lastClozeId = getLastClozeId(code);
    const thisClozeId = lastClozeId || 1;
    this.beforeCommand();
    wrap(`{{c${thisClozeId}::`, '}}');
    this.afterCommand();
};
