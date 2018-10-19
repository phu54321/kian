import CodeMirror from 'codemirror'
import Vue from 'vue'

CodeMirror.commands.makeTable = function (cm) {
  const tableData = cm.getSelection()

  const lines = tableData.split('\n').filter(x => x)
  const cells = lines.map(x => x.split('|').map(x => x.trim()))
  const colCount = Math.max.apply(null, cells.map(x => x.length))
  const rowCount = cells.length

  if (!(rowCount && colCount)) {
    Vue.toasted.error('To make a table, you need to select some text.', {
      icon: 'exclamation-triangle'
    })
    return
  } else if (rowCount === 1) {
    Vue.toasted.error('Header-only (single row) table not supported', {
      icon: 'exclamation-triangle'
    })
    return
  }

  const output = []
  for (let y = 0; y < rowCount; y++) {
    const row = cells[y]
    while (row.length < colCount) row.push('')
    output.push('|')
    for (let x = 0; x < colCount; x++) {
      output.push(' ')
      output.push(row[x])
      output.push(' |')
    }
    output.push('\n')
    if (y === 0) {
      output.push('|' + ' -- |'.repeat(colCount) + '\n')
    }
  }

  cm.replaceSelection(output.join(''))
}
