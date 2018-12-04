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
.iframe-container
  iframe(
    :style='{display: (currentIframe === 1) ? "block" : "none"}',
    ref='iframe1', :srcdoc='html1', @load='onLoad(1)')
  iframe(
    :style='{display: (currentIframe === 2) ? "block" : "none"}',
    ref='iframe2', :srcdoc='html2', @load='onLoad(2)')
</template>

<script>
const template = `
<!doctype html>
<html>
<head>
<title>Inframe html</title>
<style>
img {
    max-width: 95%;
}
body {
    font-family: "Noto Sans", "Noto Sans CJK KR", -apple-system,
        Helvetica, Arial, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>

<script>
function eventPassThrough(e) {
    const newEvent = new e.constructor(e.type, e);
    parent.document.body.dispatchEvent(newEvent);
}

window.addEventListener('keydown', eventPassThrough);

</scr` + `ipt>
<head>
<title>Iframe</title>
</head>
<body>
{{content}}
</body>
</html>
`

function renderTemplate (html) {
  return template.replace('{{content}}', html)
}

export default {
  props: ['html'],
  data () {
    return {
      currentIframe: 1,
      html1: renderTemplate(this.html),
      html2: ''
    }
  },
  watch: {
    html (v) {
      if (this.currentIframe === 1) {
        this.html2 = renderTemplate(v)
      } else {
        this.html1 = renderTemplate(v)
      }
    }
  },
  methods: {
    onLoad (iframeIndex) {
      const thisIframe = (iframeIndex === 1) ? this.$refs.iframe1 : this.$refs.iframe2
      if (thisIframe.srcdoc === '') return

      this.currentIframe = iframeIndex
    }
  }
}
</script>

<style scoped lang=scss>

.iframe-container {
    width: 100%;
    height: 100%;

    iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
    }
}

</style>
