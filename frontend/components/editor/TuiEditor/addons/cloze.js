import { getLastClozeId } from '../../utils/cloze';
import CodeMirror from 'codemirror';
import './tui/overlay.js';
import './tui/gfm.js';
import './clozeOverlayStyle.css';


CodeMirror.commands.cloze = function (cm) {
    const selections = cm.getSelections();
    const lastClozeId = getLastClozeId(cm.getValue());
    const replacements = selections.map((sel, index) => `{{c${lastClozeId + index + 1}::${sel}}}`);
    cm.replaceSelections(replacements);

    cm.setSelections(cm.listSelections().map((sel, index) => {
        if(!selections[index]) {
            sel.head.ch -= 2;
            sel.anchor.ch -= 2;
        }
        return sel;
    }));
};

CodeMirror.commands.clozeSame = function (cm) {
    const selections = cm.getSelections();
    const lastClozeId = getLastClozeId(cm.getValue()) || 1;
    const replacements = selections.map((sel) => `{{c${lastClozeId}::${sel}}}`);
    cm.replaceSelections(replacements);

    cm.setSelections(cm.listSelections().map((sel, index) => {
        if(!selections[index]) {
            sel.head.ch -= 2;
            sel.anchor.ch -= 2;
        }
        return sel;
    }));
};



CodeMirror.defineMode('kian_gfm', function (config, modeConfig) {
    const STATE_TEXT = 1;
    const STATE_CLOZE_TEXT = 2;
    const STATE_CLOZE_HINT = 3;

    const clozeHighlighter = {
        startState () {
            return {
                mode: STATE_TEXT
            };
        },
        token (stream, state) {
            switch(state.mode) {
            case STATE_TEXT:
                if(stream.match(/\{\{c(\d+)::/)) {
                    state.mode = STATE_CLOZE_TEXT;
                    return 'cloze-header';
                }
                else {
                    stream.next();
                    return null;
                }

            case STATE_CLOZE_TEXT:
                if(stream.match('::')) {
                    state.mode = STATE_CLOZE_HINT;
                    return 'cloze-hint-separator';
                }
                else if(stream.match('}}')) {
                    state.mode = STATE_TEXT;
                    return 'cloze-footer';
                }
                else {
                    stream.next();
                    return null;
                }

            case STATE_CLOZE_HINT:
                if(stream.match('}}')) {
                    state.mode = STATE_TEXT;
                    return 'cloze-footer';
                }
                else {
                    stream.next();
                    return 'cloze-hint';
                }
            }
        }
    };

    const gfmConfig = {};
    for (var attr in modeConfig) {
        gfmConfig[attr] = modeConfig[attr];
    }
    gfmConfig.name = 'gfm';
    return CodeMirror.overlayMode(clozeHighlighter, CodeMirror.getMode(config, gfmConfig));

}, 'markdown');
