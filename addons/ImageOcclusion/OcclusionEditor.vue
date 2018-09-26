<template lang='pug'>

.editor
    .editor-header
        h2 Image occlusion revisited
    .editor-body
        svg-edit(v-model='svgData', background-image-url='https://s.pstatic.net/static/www/img/2018/sp_main_v180730.png')
    .editor-footer

</template>

<script>

const initialSVG = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
 <!-- Created with SVG-edit - http://svg-edit.googlecode.com/ -->
 <g>
  <title>Layer 1</title>
  <rect id="svg_1" height="64" width="186" y="82" x="121" stroke-width="5" stroke="#000000" fill="#FF0000"/>
  <rect id="svg_2" height="14" width="206" y="209" x="277" stroke-width="5" stroke="#000000" fill="#FF0000"/>
  <rect id="svg_3" height="28" width="160" y="298" x="159" stroke-width="5" stroke="#000000" fill="#FF0000"/>
  <rect id="svg_4" height="58" width="61" y="106" x="439" stroke-width="5" stroke="#000000" fill="#FF0000"/>
  <rect id="svg_5" height="48" width="204" y="336" x="385" stroke-width="5" stroke="#000000" fill="#FF0000"/>
  <rect id="svg_6" height="113" width="165" y="188" x="162" stroke-width="5" stroke="#000000" fill="#FF0000"/>
 </g>
</svg>
`;

import SvgEdit from './SvgEdit';

export default {
    components: {
        SvgEdit,
    },
    data () {
        return {
            svgData: initialSVG,
        };
    },
};

</script>

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
