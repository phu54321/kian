import ankiCall from '../ankiCall';

export async function listDeck () {
    return ankiCall('deck_list');
}

export async function getDeckInfo (deckName) {
    return ankiCall('deck_info', {
        deckName
    });
}

export function collapseDeck (deckName, collapse) {
    return ankiCall('deck_collapse', {
        deckName,
        collapse,
    });
}
