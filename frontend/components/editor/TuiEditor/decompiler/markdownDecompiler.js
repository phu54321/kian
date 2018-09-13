import TurndownService from 'turndown';

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

export default function (html) {
    return turndownService.turndown(html);
}