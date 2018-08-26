<template lang='pug'>
    v-select(:value='value', :taggable='taggable', :options='options', :disabled='disabled' @input='onInput')
</template>

<script>
import asyncData from '../../utils/asyncData';
import {ankiCall} from '../../api/ankiCall';

export default {
    props: ['value', 'apiType', 'disabled', 'taggable'],
    name: 'list-selector',
    data () {
        return {
            options: [this.value]
        };
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
