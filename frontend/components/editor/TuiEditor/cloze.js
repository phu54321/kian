import TuiEditor from 'tui-editor';
import { getLastClozeId } from '../utils/cloze';

TuiEditor.defineExtension('cloze', function (editor) {
    editor.addCommand('markdown', {
        name: 'cloze',
        exec (mde) {
            const cm = mde.getEditor();
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
            mde.focus();
        }
    });

    editor.addCommand('markdown', {
        name: 'cloze-same',
        exec (mde) {
            const cm = mde.getEditor();
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
            mde.focus();
        }
    });
});
