<template lang="pug">

.browser-tools
    b-button-group(v-if='selected.length > 0')
        b-button(size='sm', variant='outline-info', v-b-modal.changeDeck) Change deck
        b-button(size='sm', variant='outline-info', v-b-modal.changeModel) Change model
        b-button(size='sm', variant='outline-info') Add tag(s)
        b-button(size='sm', variant='outline-info') Remove tag(s)
        b-button(size='sm', variant='outline-danger') Reset scheduling

    b-modal(id='changeDeck', title='Change deck', lazy, @ok='changeDeck')
        list-selector(taggable, title='Deck name', v-model='newDeckName', apiType='deck_list')

    b-modal(id='changeModel', title='Change model', lazy, @ok='changeModel')
        list-selector(title='Model name', v-model='newModelName', apiType='model_list')


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
            newDeckName: '',
            newModelName: '',
        };
    },
    methods: {
        async changeDeck () {
            await ankiCall('card_update_deck_batch', {
                deck: this.newDeckName,
                cardIds: this.selected,
            });
            this.newDeckName = '';
            this.$emit('updateView');
        },
        async changeModel () {
            await ankiCall('card_update_model_batch', {
                model: this.newModelName,
                cardIds: this.selected,
            });
            this.newModelName = '';
            this.$emit('updateView');
        },
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
