import MarkdownIt from 'markdown-it'
import crc32 from 'crc-32'
import base64 from 'base-64'
import utf8 from 'utf8'

const encoderDom = document.createElement('div')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
})
md.use(require('markdown-it-katex'), { throwOnError: false })
md.use(require('markdown-it-underline'))
md.use(require('./comment'))

export function replaceImageByIndex (markdown, index, newHref) {
  let imgIndex = 0
  return markdown.replace(
    /!\[(.*?)\]\((.+?)\)/g,
    (match, alt) => {
      if (imgIndex++ === index) return `![${alt}](${newHref})`
      return match
    }
  )
}

export default function encodeMarkdown (markdown) {
  if (markdown === '') return ''

  let html = md.render(markdown)

  // Note: Browser may apply its specific escaping rules when HTML really gets into DOM.
  // ( for instance, browser may remove unmatched opening/closing tags without warning )
  // Since `decodeMarkdown` works on this 'escaped' html, we need to emulate the same
  // escaping process on this function for CRC32 to match.
  encoderDom.innerHTML = html
  html = encoderDom.innerHTML

  const htmlHash = crc32.str(html.trim())
  const additionalHtml = `
        <link rel="stylesheet" type="text/css" href="_kian_katex.min.css">
        <link rel="stylesheet" type="text/css" href="_kian_github_markdown.css">
    `
  return `<script class='tui-md-b64' type='text/markdown' hash='${htmlHash}'>${base64.encode(utf8.encode(markdown))}</sc` + `ript>${additionalHtml}<div class='markdown-body tui-html'>${html}</div>`
}
