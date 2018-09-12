import TuiEditor from 'tui-editor';
import { getLastClozeId } from '../utils/cloze';

TuiEditor.defineExtension('cloze', function (editor) {
    editor.addCommand('markdown', {
        name: 'cloze',
        exec (mde) {
            const cm = mde.getEditor();
            const lastClozeId = getLastClozeId(cm.getValue());
            const thisClozeId = lastClozeId + 1;
            const clozeHeader = `{{c${thisClozeId}::`, clozeFooter = '}}';

            const rangeFrom = cm.getCursor('from');
            const currentSelection = cm.getSelection();
            if(!currentSelection) {
                cm.replaceSelection(clozeHeader + clozeFooter);
                cm.setSelection({
                    line: rangeFrom.line,
                    ch: rangeFrom.ch + clozeHeader.length,
                });
            } else {
                const replacedText = clozeHeader + currentSelection + clozeFooter;
                cm.replaceSelection(replacedText);
            }
            mde.focus();
        }
    });
});
