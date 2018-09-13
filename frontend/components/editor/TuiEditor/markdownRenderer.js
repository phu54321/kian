import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

export default function render (markdown) {
    return md.render(markdown);
}
