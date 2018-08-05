<template lang="pug">
    div(contenteditable, @input="update")
</template>

<script>

export default {
    props:['value'],
    mounted (){
        this.$el.innerText = this.value;
    },
    methods:{
        update (event){
            this.$emit('input', event.target.innerText);
        }
    }
};

</script>
