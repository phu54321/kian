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
        :renderer='(v) => ({ title: v, variant: "info" })',
        :validator='modelValidator',
        :suggestions='modelSuggestions')

    span(
        v-for='(model, index) in modelList',
        v-hotkey='`ctrl+${index + 1}`',
        pack-name='Quick model select',
        :title='model',
        @click='changeModel(model)')

</template>

<script>

import SpaceSeperatedInput from '../common/SpaceSeperatedInput';
import { fuzzyMatch } from '~/utils/utils';


export default {
    components: {
        SpaceSeperatedInput,
    },
    data () {
        const selectorList = this.$localStorage.get('quick_model_selector_list');
        return {
            availableModels: [],
            modelList: selectorList ? JSON.parse(selectorList) : []
        };
    },
    async asyncData () {
        return {
            availableModels: await this.$ankiCall('model_list'),
        };
    },
    methods: {
        modelValidator (model) {
            return this.availableModels.indexOf(model) !== -1;
        },
        modelSuggestions (m) {
            return this.availableModels.filter(model => fuzzyMatch(m, model));
        },
        onInput (val) {
            this.modelList = val;
            this.$localStorage.set('quick_model_selector_list', JSON.stringify(val));
        },
        changeModel (model) {
            this.$toasted.show(`Quick model change to "${model}"`, {
                icon: 'sync'
            });
            this.$emit('input', model);
        }
    },
};
</script>
