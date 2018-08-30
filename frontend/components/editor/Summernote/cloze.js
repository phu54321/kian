import { wrap } from './common';
import { addHotkey, addFunctions } from './summernoteExtend';

function getLastClozeId (code) {
    let maxClozeId = 0;
    code.replace(/\{\{c(\d+)::/g, (match, g1) => {
        const clozeId = parseInt(g1);
        if (maxClozeId < clozeId) maxClozeId = clozeId;
    });
    return maxClozeId;
}

addHotkey({
    'CTRL+SHIFT+C': 'newCloze',
    'CTRL+SHIFT+ALT+C': 'sameCloze',
});

addFunctions({
    newCloze () {
        const code = this.context.invoke('code');
        const lastClozeId = getLastClozeId(code);
        const thisClozeId = lastClozeId + 1;
        this.beforeCommand();
        wrap(`{{c${thisClozeId}::`, '}}');
        this.afterCommand();
    },
    sameCloze () {
        const code = this.context.invoke('code');
        const lastClozeId = getLastClozeId(code);
        const thisClozeId = lastClozeId || 1;
        this.beforeCommand();
        wrap(`{{c${thisClozeId}::`, '}}');
        this.afterCommand();
    }
});
