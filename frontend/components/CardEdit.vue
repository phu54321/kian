<template lang="pug">
b-form(@submit='save')
    h2 Edit card

    card-editor(v-model='card', @save='save')
</template>

<script>

import {ankiCall} from '../api/ankiCall';
import asyncData from '../utils/asyncData';
import ErrorDialog from './ErrorDialog';
import CardEditor from './editor/CardEditor';


export default {
    props: {
        cardId: Number,
    },
    components: {
        CardEditor,
    },
    data () {
        return {
            card: {
                deck: '',
                model: '',
                tags: [],
                fields: [],
                fieldFormats: [],
            }
        };
    },
    methods: {
        save () {
            ankiCall('card_update', {
                cardId: this.cardId,
                deck: this.card.deck,
                fields: this.card.fields,
                tags: this.card.tags,
            }).then(() => {
                this.$router.go(-1);
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
            });
        }
    },
    mixins: [asyncData(async props => {
        const cardId = props.cardId;
        const card = await ankiCall('card_get', {
            cardId
        });
        return {
            card: {
                model: card.model,
                deck: card.deck,
                fields: card.fields,
                fieldFormats: card.fieldFormats,
                tags: card.tags,
            }
        };
    })],
    name: 'card-edit',
};

</script>
