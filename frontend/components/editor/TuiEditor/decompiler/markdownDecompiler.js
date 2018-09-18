import TurndownService from 'turndown';
import crc32 from 'crc-32';
import base64 from 'base-64';
import utf8 from 'utf8';

const turndownService = new TurndownService();
const gfm = require('turndown-plugin-gfm').gfm;
turndownService.use(gfm);

turndownService.addRule('kianComment', {
    filter (node) {
        return (
            node.nodeName.toLowerCase() === 'font' &&
            node.getAttribute('color') === '#00aaff'
        );
    },
    replacement: function (content) {
        return '//' + content + '//';
    }
});

// turndownService.keep(['font']);
turndownService.remove(['script']);

export function turndown (html) {
    return turndownService.turndown(html);
}

function getMarkdownContent (domElement) {
    let markdownElements;

    markdownElements = domElement.getElementsByClassName('tui-md');
    if(markdownElements.length === 1) return {
        markdown: markdownElements[0].innerHTML,
        expectedHtmlCRC: markdownElements[0].getAttribute('hash'),
    };

    try {
        markdownElements = domElement.getElementsByClassName('tui-md-b64');
        if(markdownElements.length === 1) return {
            markdown: utf8.decode(base64.decode(markdownElements[0].innerHTML)),
            expectedHtmlCRC: markdownElements[0].getAttribute('hash'),
        };
    } catch (e) {;}  // Error might occur during utf8.decode

    return {};
}

export default function decodeMarkdown (html) {
    if(!html) return '';

    const parser = new DOMParser();
    const domElement = parser.parseFromString(html, 'text/html');
    
    const { markdown, expectedHtmlCRC } = getMarkdownContent(domElement);
    if(!markdown) return null;

    const htmlElement = domElement.getElementsByClassName('tui-html');
    if(htmlElement.length !== 1) return null;
    const renderedHtml = htmlElement[0].innerHTML;
    const htmlCRC = crc32.str(renderedHtml.trim());

    if(htmlCRC.toString() !== expectedHtmlCRC) return null;

    return markdown;
}