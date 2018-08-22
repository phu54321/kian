<template lang="pug">
card-editor(
    v-if='card',
    v-model='card',
    deck-fixed,
    model-fixed,
    @save='onNoteEdit'
)
</template>

<script>

import { ankiCall } from '../../api/ankiCall';
import CardEditor from '../editor/CardEditor';
import ErrorDialog from '../ErrorDialog';

export default {
    props: ['cardId'],
    components: {
        CardEditor,
        ErrorDialog,
    },
    asyncComputed: {
        card () {
            return ankiCall('card_get', {
                cardId: this.cardId
            });
        },
    },
    methods: {
        onNoteEdit () {
            const card = this.card;
            if(!card) return;

            ankiCall('card_update', {
                cardId: card.id,
                deck: card.deck,
                fields: card.fields,
                tags: card.tags,
            }).then(() => {
                this.$emit('updateView');
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
            });
        },
    }
};

</script>
