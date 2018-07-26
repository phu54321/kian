module.exports = {
    renderCards (card, style) {
        const fields = card.fields;

        const nField = fields.n;
        const foundFragmentSet = {};
        const frontFragmentSet = {};
        const backFragmentSet = {};
        nField.replace(/{{c(\d+)::(.+?)}}/g, function (match, p1, _p2) {
            match = parseInt(p1);
            if(foundFragmentSet[match]) return;
            foundFragmentSet[match] = true;
            frontFragmentSet[match] = nField.replace(new RegExp(`{{c${p1}::(.+?)}}`,'g'), function (_match, _p1) {
                return '__***[..]***__';
            });
            backFragmentSet[match] = nField.replace(new RegExp(`{{c${p1}::(.+?)}}`,'g'), function (_match, p1) {
                return `__**${p1}**__`;
            });
        });

        const ret = {};
        const {front: frontMarkup, back: backMarkup} = style.template[0];
        Object.keys(foundFragmentSet).forEach(k => {
            ret[`Cloze ${k}`] = {
                front: frontMarkup.replace('{{cloze:n}}', frontFragmentSet[k]),
                back: backMarkup.replace('{{cloze:n}}', backFragmentSet[k]),
            };
        });
        return ret;
    }
};