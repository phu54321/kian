export function getLastClozeId (card) {
    let maxClozeId = 0;
    card.fields.forEach(field => {
        field.replace(/\{\{c(\d+)::/g, (match, g1) => {
            const clozeId = parseInt(g1);
            if (maxClozeId < clozeId) maxClozeId = clozeId;
        });
    });
    return maxClozeId;
}
