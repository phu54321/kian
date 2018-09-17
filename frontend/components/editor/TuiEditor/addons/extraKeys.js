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
    'Alt-Left': 'indentLess',
    'Alt-Right': 'indentOrderedList',
    'Enter': 'newlineAndIndentContinueMarkdownList',
    'Alt-Up': 'replaceLineTextToUpper',
    'Alt-Down': 'replaceLineTextToLower',
};

// Re-enable tab navigation
delete CodeMirror.keyMap.basic['Tab'];
delete CodeMirror.keyMap.basic['Shift-Tab'];
delete CodeMirror.keyMap.sublime['Shift-Tab'];

// For 'save note' keys
delete CodeMirror.keyMap.sublime['Ctrl-Enter'];
delete CodeMirror.keyMap.sublime['Cmd-Enter'];

delete CodeMirror.keyMap.default['Ctrl-S'];
delete CodeMirror.keyMap.default['Cmd-S'];

// MPC → Mac conversion
const isMac = (CodeMirror.keyMap.sublime === CodeMirror.keyMap.macSublime);
Object.keys(extraKeys).forEach(pcKeyString => {
    const f = extraKeys[pcKeyString];
    const macKeyString = pcKeyString.replace('Ctrl', 'Cmd');
    delete extraKeys[pcKeyString];
    extraKeys[isMac ? macKeyString : pcKeyString] = f;
});

export default extraKeys;
