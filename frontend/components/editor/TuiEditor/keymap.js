import TuiEditor from 'tui-editor';

const newKeymap = {
    'CTRL+B': 'bold-multiselect',
    'CTRL+I': 'italic-multiselect',
    'CTRL+.': 'Blockquote',
    'CTRL+U': 'underline-multiselect',
    'SHIFT+CTRL+S': 'Strike',
    'SHIFT+CTRL+C': 'cloze',
    'SHIFT+CTRL+F': 'cloze-same',
};

TuiEditor.defineExtension('kian-keymap', function (editor) {
    setTimeout(() => {
        const keyMap = Object.assign({}, newKeymap);
        Object.keys(newKeymap).forEach(k => {
            if(k.indexOf('CTRL') !== -1) {
                keyMap[k.replace('CTRL', 'META')] = newKeymap[k];
            }
        });
        editor.commandManager.keyMapCommand = keyMap;
    }, 0);
});
