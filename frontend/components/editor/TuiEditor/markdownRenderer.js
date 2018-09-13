import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
    html: true,
    linkify: true,
});

export default function render (markdown) {
    return md.render(markdown);
}
