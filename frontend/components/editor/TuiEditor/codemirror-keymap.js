import CodeMirror from 'codemirror';
import 'codemirror/keymap/sublime.js';

export const customKeymap = {
    'CTRL+B': 'bold',
    'CTRL+I': 'italic',
    'CTRL+U': 'underline',
    'SHIFT+CTRL+S': 'Strike',
    'SHIFT+CTRL+C': 'cloze',
    'SHIFT+CTRL+F': 'clozeSame',
};

setTimeout(() => {
    console.log(CodeMirror.keyMap);
    // const sublimeKeymap = CodeMirror.keyMap.sublime;

    // Object.keys(customKeymap).forEach(kString => {
    //     const f = customKeymap[kString];
    //     const pcKeyString = kString.replace(/\+/g, '-');
    //     const macKeyString = pcKeyString.replace('CTRL', 'CMD');
    //     sublimeKeymap[pcKeyString] = f;
    //     sublimeKeymap[macKeyString] = f;
    // });

    // console.log(sublimeKeymap);

    // CodeMirror.normalizeKeyMap(sublimeKeymap);
}, 1000);