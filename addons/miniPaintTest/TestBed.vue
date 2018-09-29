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
.mainDiv.d-flex.flex-column
    h1.mb-4 Testbed

    mini-paint.flex-fill(v-model='url')
    | {{url}}

</template>

<script>

import MiniPaint from '~/components/MiniPaint';

export default {
    components: {
        MiniPaint,
    },

    data () {
        return {
            url: 'favicon.png',
        };
    },
};

</script>

<style scoped lang='scss'>

.mainDiv {
    height: 100%;
}

</style>
