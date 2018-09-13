import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
    html: true,
    linkify: true,
});

import KianComment from './comment';
KianComment(md);

export default function render (markdown) {
    return md.render(markdown);
}
