import TuiEditor from 'tui-editor';

export const tuiEditorKeymap = {
    'CTRL+B': 'boldMultiselect',
    'CTRL+I': 'italicMultiselect',
    'SHIFT+CTRL+RIGHT': 'Blockquote',
    'CTRL+U': 'underlineMultiselect',
    'SHIFT+CTRL+S': 'Strike',
    'SHIFT+CTRL+C': 'cloze',
    'SHIFT+CTRL+F': 'clozeSame',
};

TuiEditor.defineExtension('kian-keymap', function (editor) {
    setTimeout(() => {
        const keyMap = Object.assign({}, tuiEditorKeymap);
        Object.keys(tuiEditorKeymap).forEach(k => {
            if(k.indexOf('CTRL') !== -1) {
                keyMap[k.replace('CTRL', 'META')] = tuiEditorKeymap[k];
            }
        });
        editor.commandManager.keyMapCommand = keyMap;
    }, 0);
});
