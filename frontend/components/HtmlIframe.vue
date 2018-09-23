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
    iframe(ref='iframe', :srcdoc='computedHtml')
</template>

<script>

const template = `
<!doctype html>
<html>
    <head>
        <title>Inframe html</title>
        <style>img { max-width: 95%; max-height: 95%; }</style>
        <script>

function eventPassThrough(e) {
    const newEvent = new e.constructor(e.type, e);
    parent.document.body.dispatchEvent(newEvent);
}

window.addEventListener('keydown', eventPassThrough);


        </scr` + `ipt>
    <head>
        <body>
            {{content}}
        </body>
    </head>
</html>
`;

export default {
    props: ['html'],
    computed: {
        computedHtml () {
            return template.replace('{{content}}', this.html);
        }
    },
};

</script>

<style scoped lang=scss>

iframe {
    display: block;
    width: 100%;
    border: none;
}

</style>
