import CodeMirror from 'codemirror';

const extraKeys = {
    'Ctrl-B': 'bold',
    'Ctrl-I': 'italic',
    'Ctrl-U': 'underline',
    'Shift-Ctrl-S': 'strikethrough',
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


// For 'save note' keys
delete CodeMirror.keyMap.pcSublime['Ctrl-Enter'];
delete CodeMirror.keyMap.macSublime['Cmd-Enter'];

delete CodeMirror.keyMap.pcDefault['Ctrl-S'];
delete CodeMirror.keyMap.pcDefault['Cmd-S'];

// MPC → Mac conversion
const isMac = (CodeMirror.keyMap.sublime === CodeMirror.keyMap.macSublime);
Object.keys(extraKeys).forEach(pcKeyString => {
    const f = extraKeys[pcKeyString];
    const macKeyString = pcKeyString.replace('Ctrl', 'Cmd');
    delete extraKeys[pcKeyString];
    extraKeys[isMac ? macKeyString : pcKeyString] = f;
});

export default extraKeys;
