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
// along with this program.  If not, see "http://www.gnu.org/licenses/".

<template lang="pug">
div
  h1.mb-4 Testbed
  p Not in use now...

  paint(v-model='url')
</template>

<script lang='ts'>
import PaintVue from '@/components/Paint.vue'
import Vue from 'vue'

const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAABkCAIAAAAkO6ghAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAExSURBVHhe7dyhrQJREEDRhRLwKEJCA5Txf3c0AuUQFJ4WFvMkjsAFco7Z0TfjdvIW8zxPvN1yfHkv3Ru6N3Rv6N7QvaF7Q/eG7g3dG7o3dG/o3tC9oXtD94buDd0bujd0b+jeeOqe4Lbejum3rK7nMb2MfW/o3tC9oXtD94buDd0bujd0b+je0L2he0P3hu4N3Ru6N3Rv6N7QveH/6gP7w25MT7j8n8b0iH1v6N7QvaF7Q/eG7g3dG7o3dG/o3tC9oXtD94buDd0bujd0b+je0L2he0P3hu6Nr3x3f3P8G9MHc8fxiXRv6N7QvaF7Q/eG7g3dG7o3dG/o3tC9oXtD94buDd0bujd0b+je0L2he0P3hu4N3Ru6N77yXuwH2PeG7g3dG7o3dG/o3tC9oXthmu5vXxm1ZjqlmgAAAABJRU5ErkJggg=='

export default Vue.extend({
  components: {
    Paint: PaintVue
  },
  data () {
    return {
      url: testImageUrl
    }
  }
})
</script>