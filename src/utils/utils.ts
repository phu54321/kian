import fuzzysearch from 'fuzzysearch'
import * as Hangul from 'hangul-js'
import leftPad from 'left-pad'

export function clamp (x: number, min: number, max: number) {
  if (x < min) x = min
  if (x > max) x = max
  return x
}

function joinArray (x: string[] | string) {
  if (Array.isArray(x)) return x.join('')
  else return x
}

export function fuzzyMatch (needle: string, haystack: string) {
  needle = joinArray(Hangul.disassemble(needle))
  haystack = joinArray(Hangul.disassemble(haystack))
  return fuzzysearch(needle.toLowerCase(), haystack.toLowerCase())
}

export function focusNextElement () {
  const focussableElements = (
    'a:not([disabled]),' +
        'button:not([disabled]),' +
        'input[type=text]:not([disabled]),' +
        '[tabindex]:not([disabled]):not([tabindex="-1"])'
  )
  const activeElement = document.activeElement
  const focusable = Array.prototype.filter.call(document.body.querySelectorAll(focussableElements),
    (element: HTMLElement) => {
      return element.offsetWidth > 0 || element.offsetHeight > 0 || element === activeElement
    })
  const index = activeElement ? focusable.indexOf(activeElement) : -1
  if (index + 1 < focusable.length) focusable[index + 1].focus()
}

export function formatDate (date: Date) {
  if (date === null) return ''
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${leftPad(month, 2, '0')}-${leftPad(day, 2, '0')}`
}

export function formatTime (second: number) {
  return `${(second / 60).toFixed(1)}m`
}

export function escapeHtml (unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
