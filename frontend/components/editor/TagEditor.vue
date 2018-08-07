<template lang="pug">
    div
        span.mr-3.font-weight-bold Tags
        b-badge.mr-2(v-for='tag in tags', :key='tag') {{tag}}
</template>

<script>
export default {
    props: ['value'],
    computed: {
        tags () {
            return ['t1', 't2', 't3']; // this.value;
        }
    }
};
</script>

<style scoped>

</style>
