<template lang='pug'>

.editor
    .editor-header
        h2 Image occlusion revisited
    .editor-body
        iframe(src='/imgocld/svgedit/svg-editor.html', width='100%', height='100%')
    .editor-footer

</template>

<style scoped lang='scss'>

.editor {
    display: flex;
    flex-direction: column;
    height: 100%;

    .editor-body {
        flex: 1;
        overflow-y: hidden;
        iframe {
            border: none;
        }
    }
}

</style>
