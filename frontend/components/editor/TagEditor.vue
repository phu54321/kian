<template lang='pug'>
space-seperated-input(
    :value='value',
    @input='v => $emit("input", v)'
    placeholder='Add new tags...',
    :suggestions='fetchTags'
    :renderer='tagRenderer')

</template>

<script>

import {ankiCall} from '../../api/ankiCall';
import SpaceSeperatedInput from '../common/SpaceSeperatedInput';

export default {
    props: ['value'],
    components: {
        SpaceSeperatedInput,
    },
    methods: {
        tagRenderer (tag) {
            if(tag === 'marked') return {
                variant: 'danger',
                title: tag
            };
        },
        async fetchTags (tag) {
            return ankiCall('tag_suggestions', {
                query: tag
            });
        },
    },
};
</script>
