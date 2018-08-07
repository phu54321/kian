<template lang="pug">
    div.tag-box
        span.mr-3.font-weight-bold Tags
        span.mr-2.tag-existing(v-for='tag in tags', :key='tag')
            b-badge(variant='secondary')
                | {{tag}}
                span(@click='removeTagByName(tag)')
                    icon.ml-1(name='times-circle', scale='.75')
        input.tag-new(v-model='buildingTag', @keydown='checkTag', @input='emitTag', placeholder='Add new tags...')
</template>

<script>

import { KEY_MAP } from '../../utils/keycode';

export default {
    props: ['value'],
    data () {
        return {
            tags: this.value,
            buildingTag: '',
        };
    },
    methods: {
        checkTag (e) {
            if(e.keyCode == KEY_MAP['SPACE'] || e.keyCode == KEY_MAP['ENTER']) {
                const newTag = this.buildingTag.trim();
                if(newTag && this.tags.indexOf(newTag) == -1) this.tags.push(newTag);
                this.buildingTag = '';
                event.preventDefault();
            }
            this.emitTag();
        },
        removeTagByName (name) {
            const index = this.tags.indexOf(name);
            if(index == -1) return;
            this.tags.splice(index, 1);
            this.emitTag();
        },
        emitTag () {
            const tags = this.tags.slice();
            const newTag = this.buildingTag.trim();
            if(newTag && tags.indexOf(newTag) == -1) tags.push(newTag);
            this.$emit('input', tags);
            console.log(tags);
        }
    },
    computed: {
        combinedTag () {
            const ret = this.tags.slice();
            if(this.buildingTag) ret.push(this.buildingTag);
            return ret;
        },
    }
};
</script>

<style lang='scss' scoped>

.tag-box {
    display: flex;
    .tag-existing {
        flex: 0;
        vertical-align: top;
    }
    .tag-new {
        -webkit-appearance: none;
        -moz-appearance: none;

        font-size: .85em;
        padding-top: .25em;

        outline: none;
        border: none;
        box-shadow: none;
        flex: 1;
    }

}


</style>
