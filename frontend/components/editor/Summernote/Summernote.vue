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
    div(v-html.once="value")
</template>
<script>

import $ from 'jquery';
import { ankiCall } from '../../../api/ankiCall';
import './cloze';
import './table';
import './htmledit';
import './disableUnwantedHotkeys';
import { getFileAsBase64 } from '../../../utils/fileToBase64';


export default {
    props : {
        value: {
            required: true
        },
    },
    watch: {
        value (val) {
            const oldVal = $(this.$el).summernote('code');
            if(oldVal !== val) {
                $(this.$el).summernote('code', val);
            }
        }
    },
    mounted () {
        $(this.$el).summernote({
            prettifyHtml: true,
            autogrow: true,
            toolbar: [],
            disableLinkTarget: true,
            callbacks: {
                onChange: () => {
                    this.$emit('input', $(this.$el).summernote('code'));
                },
                async onImageUpload (files) {
                    for(let i = 0 ; i < files.length ; i++) {
                        const file = files[i];
                        const filename = file.name;
                        const datab64 = await getFileAsBase64(file);
                        const webFilename = await ankiCall('media_upload', {
                            filename,
                            datab64,
                        });
                        $(this).summernote('insertImage', webFilename);
                    }
                }
            }
        });
    },
    beforeDestroy () {
        $(this.$el).summernote('destroy');
    }
};

</script>

<style lang='scss'>

.note-editor {
    .note-editable {
        padding: 0 !important;
        img {
            max-width: 100%;
        }
    }

    // No resize bar
    .note-statusbar {
        display: none;
    }

    p {
        margin: 0 !important;
    }
}

.note-frame {
    border: none !important;
}


</style>