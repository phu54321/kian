<template lang="pug">
div
  canvas(ref='mainCanvas', width.once=100, height.once=100)

</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator'

@Component({})
export default class extends Vue {
  @Prop(String) value!: string

  get mainCanvas () {
    return this.$refs.mainCanvas as HTMLCanvasElement
  }
  mounted () {
    // Load initial image
    const { mainCanvas } = this
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = () => {
      mainCanvas.width = img.width
      mainCanvas.height = img.height

      const ctx = mainCanvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
    }

    img.src = this.value
  }
}
</script>
