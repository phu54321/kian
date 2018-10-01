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
b-container.pt-4
    .float-right
        b-btn-group
            b-btn(variant='outline-primary', size='sm', @click='removeEmptyCards') Remove empty cards
            b-btn(variant='outline-primary', size='sm', @click='checkDatabase') Check database
            b-btn(variant='outline-primary', size='sm', @click='removeUnusedMedia') Remove unused media

    h2 Config


</template>

<script>

export default {
    methods: {
        async removeEmptyCards () {
            const loader = this.$loading.show();
            const cardIds = await this.$ankiCall('col_emptycards_get');
            if (cardIds.length) {
                this.$toasted.show(`${cardIds.length} empty card(s) removed.`);
                await this.$ankiCall('col_card_remove_batch', { cardIds });
            } else {
                this.$toasted.show('No empty cards.');
            }
            loader.hide();
        },

        async checkDatabase () {
            const loader = this.$loading.show();
            try {
                const ret = await this.$ankiCall('col_check');
                this.$toasted.show(ret, { icon: 'check' });
            } catch (e) {
                this.$toasted.error(e.message, { icon: 'exclamation-triangle' });
            } finally {
                loader.hide();
            }
        },

        async removeUnusedMedia () {
            const loader = this.$loading.show();
            try {
                const { missing, unused } = await this.$ankiCall('media_check');
                if (missing.length) {
                    this.$toasted.info(`${missing.length} files missing`, { icon: 'exclamation-triangle' });
                }
                if (unused.length) {
                    const deleteFailed = await this.$ankiCall('media_remove', { filenames: unused });
                    const msg = (deleteFailed === 0)
                        ? `${unused.length} unused files removed`
                        : `${unused.length} unused files, ${unused.length - deleteFailed} removed`;
                    this.$toasted.show(msg, { icon: 'check' });
                }
            } catch (e) {
                this.$toasted.error(e.message, { icon: 'exclamation-triangle' });
            } finally {
                loader.hide();
            }
        },
    },
};

</script>
