<template lang="pug">
    v-container
        v-card
            v-card-title(primary-title)
                .headline Deck list
            v-card-text
                span Test
</template>

<script>
  export default {
    data () {
      return {
        decks: [],
      };
    },
    name: 'home',
  };
</script>