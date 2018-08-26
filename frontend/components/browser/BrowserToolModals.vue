<template lang="pug">

div
    b-modal(id='changeDeck', title='Change deck', lazy, @ok='changeDeck')
        list-selector(taggable, focused, title='Deck name', v-model='newDeckName', apiType='deck_list')

    b-modal(id='changeModel', title='Change model', lazy, @ok='changeModel')
        list-selector(focused, title='Model name', v-model='newModelName', apiType='model_list')


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
            this.$emit('updateCardIds');
        },
    }
};

</script>
