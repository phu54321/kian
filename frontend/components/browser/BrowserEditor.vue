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
import { runHook } from '../../hook/hookBase';

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

            runHook('edit_note', {
                cardId: this.cardId,
                deck: card.deck,
                model: card.model,
                fields: card.fields,
                tags: card.tags,
            }).then(msg => {
                return ankiCall('card_update', msg);
            }).then(() => {
                this.$emit('updateView');
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
            });
        },
    }
};

</script>
