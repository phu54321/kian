<template lang='pug'>
    b-form-select(:value='value', @input='onInput')
        option(v-for='option in options', :key='option', :value='option') {{option}}
</template>

<script>
import asyncData from '../utils/asyncData';
import {ankiCall} from '../api/ankiCall';

export default {
    props: ['value', 'apiType'],
    data () {
        return {
            options: [this.value]
        }
    },
    methods: {
        onInput(val) {
            this.$emit('input', val);
        }
    },
    mixins: [asyncData(async props => {
        const options = await ankiCall(props.apiType);
        options.sort();
        return {
            options
        };
    })],
}
</script>
