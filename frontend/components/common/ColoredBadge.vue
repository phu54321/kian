<template lang='pug'>

b-badge(
    :variant='renderedItem.variant'
    :style='{ "background-color": renderedItem.color }')
    | {{renderedItem.title}}
    slot

</template>

<script>

export default {
    props: {
        renderer: {
            type: Function,
            default: c => undefined
        },
        item: String
    },
    computed: {
        renderedItem () {
            const ret = this.renderer(this.item) || {
                variant: 'secondary',
                title: this.item
            };
            ret.origValue = this.item;
            return ret;
        },
    },
    name: 'colored-badge',
}

</script>
