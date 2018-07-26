module.exports = {
    renderCards (card, style) {
        const fields = card.fields;
        const {front: frontMarkup, back: backMarkup} = style.template[0];

        const clozeFields = new Set;
        const fragmentMap = {};
        frontMarkup.replace(/{{cloze:(.+?)}}/g, function (match, p1) {
            clozeFields.add(p1);
        });

        const clozeIndexWithFragments = new Set;
        clozeFields.forEach(fieldName => {
            const field = fields[fieldName];
            const foundFragmentSet = new Set;
            const frontFragmentMap = {};
            const backFragmentMap = {};
            field.replace(/{{c(\d+)::(.+?)}}/g, function (match, p1, _p2) {
                match = parseInt(p1);
                if(foundFragmentSet.has(match)) return;
                foundFragmentSet.add(match);
                clozeIndexWithFragments.add(match);
                frontFragmentMap[match] = field.replace(new RegExp(`{{c${p1}::(.+?)}}`,'g'), function (_match, _p1) {
                    return '__***[..]***__';
                });
                backFragmentMap[match] = field.replace(new RegExp(`{{c${p1}::(.+?)}}`,'g'), function (_match, p1) {
                    return `__**${p1}**__`;
                });
            });
            fragmentMap[fieldName] = {
                front: frontFragmentMap,
                back: backFragmentMap,
            };
        });


        const ret = {};
        clozeIndexWithFragments.forEach(k => {
            ret[`Cloze ${k}`] = {
                front: frontMarkup.replace(/{{cloze:(.+?)}}/g, function (match, p1) {
                    return fragmentMap[p1].front[k];
                }),
                back: backMarkup.replace(/{{cloze:(.+?)}}/g, function (match, p1) {
                    return fragmentMap[p1].back[k];
                }),
            };
        });
        return ret;
    }
};
