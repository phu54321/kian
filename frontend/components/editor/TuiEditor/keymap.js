import TuiEditor from 'tui-editor';

const newKeymap = {
    'CTRL+B': 'Bold',
    'CTRL+I': 'Italic',
    'CTRL+.': 'Blockquote',
    'CTRL+U': 'underline',
    'SHIFT+CTRL+S': 'Strike',
    'SHIFT+CTRL+C': 'cloze',
    'SHIFT+CTRL+F': 'cloze-same',
};

TuiEditor.defineExtension('kian-keymap', function (editor) {
    setTimeout(() => {
        editor.commandManager.keyMapCommand = newKeymap;
    }, 0);
});