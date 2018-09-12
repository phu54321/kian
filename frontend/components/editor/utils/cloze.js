export function getLastClozeId (code) {
    let maxClozeId = 0;
    code.replace(/\{\{c(\d+)::/g, (match, g1) => {
        const clozeId = parseInt(g1);
        if (maxClozeId < clozeId) maxClozeId = clozeId;
    });
    return maxClozeId;
};
