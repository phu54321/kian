import TuiEditor from 'tui-editor';
import 'codemirror/keymap/sublime.js';

TuiEditor.defineExtension('codemirror-keymap', function (editor) {
    const codeMirror = editor.getCodeMirror();
    codeMirror.setOption('keyMap', 'sublime');
});
