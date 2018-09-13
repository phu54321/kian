import CodeMirror from 'codemirror';
import 'codemirror/keymap/sublime.js';

export const customKeymap = {
    // 'CTRL+B': 'boldMultiselect',
    // 'CTRL+I': 'italicMultiselect',
    // 'SHIFT+CTRL+RIGHT': 'Blockquote',
    // 'CTRL+U': 'underlineMultiselect',
    // 'SHIFT+CTRL+S': 'Strike',
    'SHIFT+CTRL+C': 'cloze',
    'SHIFT+CTRL+F': 'clozeSame',
};

Object.keys(customKeymap).forEach(kString => {
    const f = customKeymap[kString];
    const pcKeyString = kString.replace(/\+/g, '-');
    const macKeyString = kString.replace('CTRL', 'CMD');
    CodeMirror.keyMap.sublime[pcKeyString] = f;
    CodeMirror.keyMap.sublime[macKeyString] = f;
});

CodeMirror.normalizeKeyMap(CodeMirror.keyMap.sublime);
