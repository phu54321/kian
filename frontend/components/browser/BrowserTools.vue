<template lang="pug">

.browser-tools
    b-button-group(v-if='selected.length > 0')
        b-button(size='sm', variant='outline-info', v-b-modal.changeDeck) Change deck
        b-button(size='sm', variant='outline-info') Change model
        b-button(size='sm', variant='outline-info') Add tag(s)
        b-button(size='sm', variant='outline-info') Remove tag(s)
        b-button(size='sm', variant='outline-danger') Reset scheduling

    b-modal(id='changeDeck', title='Change deck', lazy, @ok='changeDeck')
        list-selector(taggable, title='Deck name', v-model='newDeckName', apiType='deck_list')


</template>

<script>

import ListSelector from '../editor/ListSelector';
import { ankiCall } from '../../api/ankiCall';

export default {
    props: ['selected'],
    components: {
        ListSelector,
    },
    data () {
        return {
            newDeckName: ''
        };
    },
    methods: {
        async changeDeck () {
            await ankiCall('card_update_deck_batch', {
                deck: this.newDeckName,
                cardIds: this.selected,
            });
            this.$emit('updateView');
        }
    }
};

</script>

<style lang="scss" scoped>

.clickthrough {
    pointer-events: none;
}

.browser-tools {
    text-align: center;
    position: sticky;
    bottom: 4em;
    z-index: 1234;
    .btn-group {
        display: inline-block;
        background-color: white;
        pointer-events: initial;
    }
}

</style>
