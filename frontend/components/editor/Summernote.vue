<template lang="pug">
    div(v-html="value")
</template>
<script>

import $ from 'jquery';



function fragFromHtml (html) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while((node = tmpDiv.firstChild)) {
        frag.appendChild(node);
    }
    return frag;
}

function wrap (front, back) {
    var s = window.getSelection();
    var r = s.getRangeAt(0);
    var content = r.extractContents();

    var span = document.createElement('span');
    span.appendChild(content);
    const oldHtml = span.innerHTML;

    if (oldHtml) {
        var match = oldHtml.match(/^(\s*)([^]*?)(\s*)$/);
        var newHtml = match[1] + front + match[2] + back + match[3];
        var frag = fragFromHtml(newHtml);
        
        r.deleteContents();
        r.insertNode(frag);
        r.collapse();
    }
    else {
        r.insertNode(fragFromHtml(front));
        r.collapse();
        r.insertNode(fragFromHtml(back));
        r.collapse(true);
    }
}


function getLastClozeId (code){
    let maxClozeId = 0;
    code.replace(/\{\{c(\d+)::/g, (match, g1) => {
        const clozeId = parseInt(g1);
        if (maxClozeId < clozeId) maxClozeId = clozeId;
    });
    return maxClozeId;
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
                theme: 'monokai',
                mode: 'text/html',
                htmlMode: true,
                lineNumbers: true
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
                            const code = context.invoke('code');
                            const lastClozeId = getLastClozeId(code);
                            const thisClozeId = lastClozeId + 1;
                            context.invoke('beforeCommand');
                            wrap(`{{c${thisClozeId}::`, '}}');
                            context.invoke('afterCommand');
                        }
                    });

                    return button.render();
                }
            },
            callbacks: {
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