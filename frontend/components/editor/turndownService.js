import TurndownService from 'turndown';

const turndownService = new TurndownService();
const gfm = require('turndown-plugin-gfm').gfm;
turndownService.use(gfm);
turndownService.keep(['font']);
turndownService.remove(['script']);

export default turndownService;