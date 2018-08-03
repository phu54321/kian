<template>
    <textarea class="form-control"></textarea>
</template>
<script>

import $ from 'jquery';

export default {
    props : {
        value: {
            required: true
        },
        height: {
            type: String,
            default: '150'
        }
    },
    mounted () {
        $(this.$el).summernote({
            callbacks: {
                onInit: () => {
                    $(this.$el).summernote('code', this.value);
                },
                onChange: () => {
                    this.$emit('input', $(this.$el).summernote('code'));
                },
            }
        });
    }
};

</script>