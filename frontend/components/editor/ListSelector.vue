<template lang='pug'>
    v-select(:value='value', :taggable='taggable', :options='options', :disabled='disabled' @input='onInput')
</template>

<script>
import asyncData from '../../utils/asyncData';
import {ankiCall} from '../../api/ankiCall';

export default {
    props: ['value', 'apiType', 'disabled', 'taggable', 'focused'],
    name: 'list-selector',
    data () {
        return {
            options: [this.value]
        };
    },
    mounted () {
        if(this.focused !== undefined) {
            const toggleEl = this.$el.querySelector('.dropdown-toggle');
            toggleEl.dispatchEvent(new Event('mousedown'));
        }
    },
    methods: {
        onInput (val) {
            this.$emit('input', val);
        }
    },
    mixins: [asyncData(async props => {
        const options = await ankiCall(props.apiType);
        options.sort();
        return {
            options
        };
    }, function () {
        if(!this.value && this.options.length !== 0) {
            this.$emit('input', this.options[0]);
        }
    })],
};
</script>
