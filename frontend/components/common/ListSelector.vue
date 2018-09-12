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
    v-select(:value='value', :taggable='taggable', :options='options', :disabled='disabled' @input='onInput')
</template>

<script>
import asyncData from '~/utils/asyncData';
import ankiCall from '~/api/ankiCall';

export default {
    props: ['value', 'apiType', 'disabled', 'taggable', 'focused'],
    name: 'list-selector',
    data () {
        return {
            options: [this.value]
        };
    },
    mounted () {
        if(this.focused !== undefined) {
            const toggleEl = this.$el.querySelector('.dropdown-toggle');
            toggleEl.dispatchEvent(new Event('mousedown'));
            setTimeout(() => toggleEl.querySelector('input').focus(), 1);
        }
    },
    methods: {
        onInput (val) {
            this.$emit('input', val);
        }
    },
    mixins: [asyncData(async props => {
        const options = await ankiCall(props.apiType);
        options.sort();
        return {
            options
        };
    }, function () {
        if(!this.value && this.options.length !== 0) {
            this.$emit('input', this.options[0]);
        }
    })],
};
</script>
