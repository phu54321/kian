import MarkdownIt from 'markdown-it';
import KianComment from './comment';
import crc32 from 'crc-32';

const md = new MarkdownIt({ html: true, linkify: true, });
KianComment(md);

const encoderDom = document.createElement('div');

export default function encodeMarkdown (markdown) {
    if(markdown === '') return '';

    let html = md.render(markdown);(markdown);

    // Note: Browser may apply its specific escaping rules when HTML really gets into DOM.
    // ( for instance, browser may remove unmatched opening/closing tags without warning )
    // Since `decodeMarkdown` works on this 'escaped' html, we need to emulate the same
    // escaping process on this function for CRC32 to match.
    encoderDom.innerHTML = html;
    html = encoderDom.innerHTML;

    const htmlHash = crc32.str(html.trim());
    return `<script class='tui-md' type='text/markdown' hash='${htmlHash}'>${markdown}</sc` + `ript><div class='tui-html'>${html}</div>`;
}
