import { getLastClozeId } from '../utils/cloze';
import CodeMirror from 'codemirror';

const cmds = CodeMirror.commands;
cmds.cloze = function (cm) {
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

cmds.clozeSame = function (cm) {
    const selections = cm.getSelections();
    const lastClozeId = getLastClozeId(cm.getValue()) || 1;
    const replacements = selections.map((sel, index) => `{{c${lastClozeId}::${sel}}}`);
    cm.replaceSelections(replacements);

    cm.setSelections(cm.listSelections().map((sel, index) => {
        if(!selections[index]) {
            sel.head.ch -= 2;
            sel.anchor.ch -= 2;
        }
        return sel;
    }));
};
