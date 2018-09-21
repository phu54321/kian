import ankiCall from '../ankiCall';

let deckList = null;

export async function listDeck () {
    if(!deckList) {
        deckList = await ankiCall('deck_list');
    }
    return deckList;
}

export async function hasDeck (deckName) {
    const deckList = await listDeck();
    return (deckList.indexOf(deckName) !== -1);
}

export async function addDeck (deckName) {
    if(await hasDeck(deckName)) return false;

    await ankiCall('deck_add', {
        deckName
    });
    return true;
}

export async function getDeckInfo (deckName) {
    return ankiCall('deck_info', {
        deckName
    });
}

export function collapseDeck (deckName, collapse) {
    return ankiCall('deck_collapse', {
        deckName,
        collapse: collapse || true,
    });
}
