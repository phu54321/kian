import ankiCall from '~/api/ankiCall'
import CodeMirror from 'codemirror'

function getAutocomplete (query) {
  return ankiCall('get_word_autocomplete', { query })
}

export default async function (cm) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)
  let start = cursor.ch
  let end = cursor.ch
  while (start && /[\w-]/.test(line.charAt(start - 1))) --start
  while (end < line.length && /[\w-]/.test(line.charAt(end))) ++end
  const word = line.slice(start, end).replace(/-/g, ' ').trim()
  if (word.length < 4) return null

  let suggestions = (await getAutocomplete(word))
    .filter(x => x.split(' ').every(seg => seg.length < 30))
    .slice(0, 10)

  if (word[0] >= 'A' && word[0] <= 'Z') { // First word is capital
    suggestions = suggestions.map(s =>
      s.split(' ').map(t => t[0].toUpperCase() + t.substr(1)).join(' ')
    )
  }

  if (suggestions.length === 1 && suggestions[0].toLowerCase() === word.toLowerCase()) return null

  if (suggestions.length) {
    return {
      list: suggestions,
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, end)
    }
  } else return null
}
