// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
                cardId: this.cardId,
                deck: card.deck,
                model: card.model,
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
