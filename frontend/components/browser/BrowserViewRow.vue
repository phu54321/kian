<template lang="pug">
    div Test
</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import asyncData from '../../utils/asyncData';

export default {
    props: ['cardId'],
    data () {
        return {
            card: {}
        };
    },
};

</script>
