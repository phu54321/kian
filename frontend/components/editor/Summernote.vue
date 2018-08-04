<template>
    <textarea class="form-control"></textarea>
</template>
<script>

import $ from 'jquery';

function wrap (context, front, back) {
    context.invoke('beforeCommand');
    const range = context.invoke('createRange');
    const frag = range.nativeRange().cloneContents();
    const span = document.createElement('span');
    span.appendChild(frag);
    const oldHtml = span.innerHTML;
    const match = oldHtml.match(/^(\s*)([^]*?)(\s*)$/);
    const newHtml = match[1] + front + match[2] + back + match[3];
    context.invoke('pasteHTML', newHtml);
    context.invoke('afterCommand');
}


export default {
    props : {
        value: {
            required: true
        },
        height: {
            type: String,
            default: '150'
        }
    },
    mounted () {
        $(this.$el).summernote({
            prettifyHtml: true,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph', 'table', 'link', 'picture']],
                ['misc', ['fullscreen', 'codeview', 'help', 'cloze']]
            ],
            codemirror: { // codemirror options
                theme: 'monokai'
            },
            buttons: {
                cloze (context) {
                    const ui = $.summernote.ui;
                    // create button
                    const button = ui.button({
                        contents: '[..]',
                        tooltip: 'Cloze',
                        click: function () {
                            // invoke insertText method with 'hello' on editor module.
                            wrap(context, '{{', '}}');
                            // context.invoke('editor.insertText', 'hello');
                        }
                    });

                    return button.render();
                }
            },
            callbacks: {
                onInit: () => {
                    $(this.$el).summernote('code', this.value);
                },
                onChange: () => {
                    this.$emit('input', $(this.$el).summernote('code'));
                },
            }
        });
    },
    beforeDestroy () {
        $(this.$el).summernote('destroy');
    }
};

</script>