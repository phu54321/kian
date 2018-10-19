<template lang='pug'>

b-modal(v-model='modalShow', size='lg', title='Image edit', hide-footer, @hidden='onHide')
    .mini-paint-container
        mini-paint(ref='miniPaint', :value='editingUrl', @input='onImageEdit')

</template>

<script>

import Vue from 'vue'

import MiniPaint from './MiniPaint'
const eventHub = new Vue()

export default {
  editImage (src) {
    return new Promise(resolve => {
      eventHub.$emit('errormsg', {
        src,
        onSave: resolve
      })
    })
  },

  data () {
    return {
      modalShow: false,
      editingUrl: null,
      onSaveCallback: null
    }
  },

  components: {
    MiniPaint
  },

  created () {
    eventHub.$on('errormsg', this.openErrorMessage)
  },

  beforeDestroy () {
    eventHub.$off('errormsg')
  },

  methods: {
    openErrorMessage (data) {
      this.editingUrl = data.src
      this.onSaveCallback = data.onSave
      this.modalShow = true
    },

    onImageEdit (newSrc) {
      const onSave = this.onSaveCallback

      this.editingUrl = null
      this.onSaveCallback = null
      this.modalShow = false

      onSave(newSrc)
    },

    onHide () {
      if (this.editingUrl === null) return
      this.$refs.miniPaint.onSave()
    }
  }
}

</script>

<style>

.mini-paint-container {
    height: 80vh;
}

</style>
