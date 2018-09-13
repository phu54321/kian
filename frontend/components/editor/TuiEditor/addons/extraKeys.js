import CodeMirror from 'codemirror';

const extraKeys = {
    'Ctrl-B': 'bold',
    'Ctrl-I': 'italic',
    'Ctrl-U': 'underline',
    'Shift-Ctrl-C': 'cloze',
    'Shift-Ctrl-F': 'clozeSame',
    'Shift-Ctrl-R': 'makeTable',
    'Ctrl-/': 'comment', 

    // Markdown editing related
    'Tab': 'indentOrderedList',
    'Enter': 'newlineAndIndentContinueMarkdownList',
    'Shift-Tab': 'indentLess',
    'Alt-Up': 'replaceLineTextToUpper',
    'Alt-Down': 'replaceLineTextToLower'
};


// MPC → Mac conversion
const isMac = (CodeMirror.keyMap.sublime === CodeMirror.keyMap.macSublime);
Object.keys(extraKeys).forEach(pcKeyString => {
    const f = extraKeys[pcKeyString];
    const macKeyString = pcKeyString.replace('Ctrl', 'Cmd');
    delete extraKeys[pcKeyString];
    extraKeys[isMac ? macKeyString : pcKeyString] = f;
});

export default extraKeys;
