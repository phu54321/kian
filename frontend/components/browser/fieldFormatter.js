import padLeft from 'pad-left';
import textVersion from 'textversionjs';

export default {
    textVersionJs (text) {
        return textVersion (text, {
            imgProcess (src, _alt) {
                return src;
            }
        });
    },
    formatOrd (ord) {
        return `#${ord + 1}`;
    },
    timeToText (timestamp) {
        if (typeof timestamp === 'string') return timestamp;
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${padLeft(month, 2, '0')}-${padLeft(day, 2, '0')}`;
    },
    concatTags (tags) {
        return tags.join(', ');
    },
};
