import TuiEditor from 'tui-editor';
import 'codemirror/keymap/sublime.js';

TuiEditor.defineExtension('sublime-keymap', function (editor) {
    const codeMirror = editor.getCodeMirror();
    codeMirror.setOption('keyMap', 'sublime');
});
