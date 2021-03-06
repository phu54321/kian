// Code modified from https://github.com/markdown-it/markdown-it/blob/master/lib/rules_inline/strikethrough.js

// ^^comment^^

// Insert each marker as a separate text token, and add it to delimiter list
//

function tokenize (state, silent) {
  var i
  var scanned
  var token
  var len
  var ch

  var start = state.pos

  var marker = state.src.charCodeAt(start)

  if (silent) { return false }

  if (marker !== 0x5E/* /^ */) { return false }

  scanned = state.scanDelims(state.pos, true)
  len = scanned.length
  ch = String.fromCharCode(marker)

  if (len < 2) { return false }

  if (len % 2) {
    token = state.push('text', '', 0)
    token.content = ch
    len--
  }

  for (i = 0; i < len; i += 2) {
    token = state.push('text', '', 0)
    token.content = ch + ch

    state.delimiters.push({
      marker: marker,
      jump: i,
      token: state.tokens.length - 1,
      level: state.level,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    })
  }

  state.pos += scanned.length

  return true
}

// Walk through delimiter list and replace text tokens with tags
//
function postProcess (state) {
  var i, j
  var startDelim
  var endDelim
  var token
  var loneMarkers = []
  var delimiters = state.delimiters
  var max = state.delimiters.length

  for (i = 0; i < max; i++) {
    startDelim = delimiters[i]

    if (startDelim.marker !== 0x5E/* ^ */) {
      continue
    }

    if (startDelim.end === -1) {
      continue
    }

    endDelim = delimiters[startDelim.end]

    token = state.tokens[startDelim.token]
    token.type = 'cm_open'
    token.nesting = 1
    token.markup = '^^'

    token = state.tokens[endDelim.token]
    token.type = 'cm_close'
    token.nesting = -1
    token.markup = '^^'

    if (state.tokens[endDelim.token - 1].type === 'text' &&
        state.tokens[endDelim.token - 1].content === '^') {
      loneMarkers.push(endDelim.token - 1)
    }
  }

  // If a marker sequence has an odd number of characters, it's splitted
  // like this: `/////` -> `/` + `//` + `//`, leaving one marker at the
  // start of the sequence.
  //
  // So, we have to move all those markers after subsequent s_close tags.
  //
  while (loneMarkers.length) {
    i = loneMarkers.pop()
    j = i + 1

    while (j < state.tokens.length && state.tokens[j].type === 'cm_close') {
      j++
    }

    j--

    if (i !== j) {
      token = state.tokens[j]
      state.tokens[j] = state.tokens[i]
      state.tokens[i] = token
    }
  }
}

module.exports = function (md) {
  md.inline.ruler.after('emphasis', 'kian_comment', tokenize)
  md.inline.ruler2.after('emphasis', 'kian_comment', postProcess)
  md.renderer.rules.cm_open = () => '<i><font color=#85d7ff>'
  md.renderer.rules.cm_close = () => '</font></i>'
}
