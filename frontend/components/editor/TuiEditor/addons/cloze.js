import { getLastClozeId } from '../../utils/cloze';
import CodeMirror from 'codemirror';

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
