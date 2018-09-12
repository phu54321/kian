import TuiEditor from 'tui-editor';

function multiselectStyler (header, footer) {
    return (mde) => {
        const cm = mde.getEditor();
        const selections = cm.getSelections();
        const replacements = selections.map(sel => {
            if(sel.startsWith(header) && sel.endsWith(footer)) {
                return sel.substring(header.length, sel.length - footer.length);
            } else return `${header}${sel}${footer}`;
        });
        cm.replaceSelections(replacements, 'around');

        cm.setSelections(cm.listSelections().map((sel, index) => {
            if(!selections[index]) {
                sel.head.ch -= footer.length;
                sel.anchor.ch = sel.head.ch;
            }
            return sel;
        }));
        mde.focus();
    };
}

TuiEditor.defineExtension('multiselect-styling', function (editor) {
    editor.addCommand('markdown', {
        name: 'bold-multiselect',
        exec: multiselectStyler('**', '**')
    });

    editor.addCommand('markdown', {
        name: 'italic-multiselect',
        exec: multiselectStyler('_', '_')
    });
});
