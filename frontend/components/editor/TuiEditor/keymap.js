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
        editor.commandManager.keyMapCommand = newKeymap;
    }, 0);
});