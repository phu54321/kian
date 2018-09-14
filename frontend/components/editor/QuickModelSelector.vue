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

<template lang='pug'>
div
    space-seperated-input(
        :value='modelList',
        @input='onInput',
        placeholder='Quick model selector...',
        :validator='modelValidator',
        :suggestions='modelSuggestions')

    span(
        v-for='(model, index) in modelList',
        v-hotkey='`ctrl+${index + 1}`',
        pack-name='Quick model select',
        :title='model',
        @click='$emit("input", model)')

</template>

<script>

import ankiCall from '~/api/ankiCall';
import SpaceSeperatedInput from '../common/SpaceSeperatedInput';
import asyncData from '~/utils/asyncData';
import { fuzzyMatch } from '~/utils/utils';


export default {
    components: {
        SpaceSeperatedInput,
    },
    data () {
        const selectorList = this.$cookie.get('quick_model_selector_list');
        return {
            availableModels: [],
            modelList: selectorList ? JSON.parse(selectorList) : []
        };
    },
    mixins: [asyncData(async () => {
        return {
            availableModels: await ankiCall('model_list'),
        };
    })],
    methods: {
        modelValidator (model) {
            return this.availableModels.indexOf(model) !== -1;
        },
        modelSuggestions (m) {
            return this.availableModels.filter(model => fuzzyMatch(m, model));
        },
        onInput (val) {
            this.modelList = val;
            this.$cookie.set('quick_model_selector_list', JSON.stringify(val));
        },
    },
};
</script>
