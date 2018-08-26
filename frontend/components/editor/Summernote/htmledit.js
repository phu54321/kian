import { addHotkey, addFunctions } from './summernoteExtend';
import $ from 'jquery';

addHotkey({
    'CTRL+SHIFT+X': 'toggleCodeView',
});

addFunctions ({
    toggleCodeView () {
        const editorContext = this.context;
        editorContext.invoke('codeview.toggle');
        this.$editor.prepend($('<div></div>')
            .text('Quit codeview')
            .addClass('codeview-exit')
            .on('click', function () {
                $(this).remove();
                editorContext.invoke('codeview.toggle');
            })
        );
    },
});
