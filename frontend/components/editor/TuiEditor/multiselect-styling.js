import CodeMirror from 'codemirror';

function multiselectStyler (header, footer) {
    return (cm) => {
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
    };
}

CodeMirror.commands.bold =  multiselectStyler('**', '**');
CodeMirror.commands.italic = multiselectStyler('_', '_');
CodeMirror.commands.underline = multiselectStyler('<u>', '</u>');
