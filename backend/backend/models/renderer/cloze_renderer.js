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
            const frontFragmentMap = {};
            const backFragmentMap = {};
            if(field) {
                const foundFragmentSet = new Set;
                field.replace(/{{c(\d+)::(.+?)}}/g, function (_match, p1, _p2) {
                    const clozeId = parseInt(p1);
                    if (foundFragmentSet.has(clozeId)) return;
                    foundFragmentSet.add(clozeId);
                    clozeIndexWithFragments.add(clozeId);
                    frontFragmentMap[clozeId] = field.replace(/{{c(\d+)::(.+?)}}/g, function (_match, p1, p2) {
                        if (parseInt(p1) === clozeId) return '__***[..]***__';
                        else return p2;
                    });
                    backFragmentMap[clozeId] = field.replace(/{{c(\d+)::(.+?)}}/g, function (_match, p1, p2) {
                        if (parseInt(p1) === clozeId) return `__**${p2}**__`;
                        else return p2;
                    });
                });
            }
            fragmentMap[fieldName] = {
                front: frontFragmentMap,
                back: backFragmentMap,
            };
        });

        const ret = {};
        clozeIndexWithFragments.forEach(k => {
            ret[`Cloze ${k}`] = {
                front: frontMarkup.replace(/{{cloze:(.+?)}}/g, function (match, p1) {
                    return fragmentMap[p1].front[k] || '';
                }),
                back: backMarkup.replace(/{{cloze:(.+?)}}/g, function (match, p1) {
                    return fragmentMap[p1].back[k] || '';
                }),
            };
        });
        return ret;
    }
};
