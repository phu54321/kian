import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({ html: true, linkify: true, });
md.use(require('markdown-it-katex'), {
    throwOnError: false,
});
md.use(require('./comment'));


import crc32 from 'crc-32';

const encoderDom = document.createElement('div');

export default function encodeMarkdown (markdown) {
    if(markdown === '') return '';

    let html = md.render(markdown);

    // Note: Browser may apply its specific escaping rules when HTML really gets into DOM.
    // ( for instance, browser may remove unmatched opening/closing tags without warning )
    // Since `decodeMarkdown` works on this 'escaped' html, we need to emulate the same
    // escaping process on this function for CRC32 to match.
    encoderDom.innerHTML = html;
    html = encoderDom.innerHTML;

    const htmlHash = crc32.str(html.trim());
    const additionalHtml = `
        <link rel="stylesheet" type="text/css" href="_kian/katex/katex.min.css">
    `;
    return `<script class='tui-md' type='text/markdown' hash='${htmlHash}'>${markdown}</sc` + `ript>${additionalHtml}<div class='tui-html'>${html}</div>`;
}
