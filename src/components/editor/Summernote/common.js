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

function fragFromHtml (html) {
  const tmpDiv = document.createElement('div')
  tmpDiv.innerHTML = html
  const frag = document.createDocumentFragment()
  let node
  while ((node = tmpDiv.firstChild)) {
    frag.appendChild(node)
  }
  return frag
}

export function copySelectedHtml () {
  const s = window.getSelection()
  const r = s.getRangeAt(0)
  const content = r.cloneContents()

  const span = document.createElement('span')
  span.appendChild(content)
  const oldHtml = span.innerHTML

  return oldHtml
}

export function pasteHtmlToSelection (newHtml) {
  const s = window.getSelection()
  const r = s.getRangeAt(0)
  const frag = fragFromHtml(newHtml)
  r.deleteContents()
  r.insertNode(frag)
  r.collapse()
  return true
}

export function wrap (front, back) {
  const oldHtml = copySelectedHtml()

  if (oldHtml) {
    const match = oldHtml.match(/^(\s*)([^]*?)(\s*)$/)
    const newHtml = match[1] + front + match[2] + back + match[3]
    pasteHtmlToSelection(newHtml)
  } else {
    const s = window.getSelection()
    const r = s.getRangeAt(0)

    r.insertNode(fragFromHtml(front))
    r.collapse()
    r.insertNode(fragFromHtml(back))
    r.collapse(true)
  }

  return true
}
