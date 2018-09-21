import ankiCall from '../ankiCall';
import { hasDeck, addDeck } from './deck';

export async function addNote ({ deck, model, fields, tags }) {
    if(!(await hasDeck(deck))) await addDeck(deck);
    return ankiCall('note_add', {
        deck,
        model,
        fields,
        tags
    });
}

export async function getCard (cardId) {
    return ankiCall('card_get', {
        cardId
    });
}

export async function updateCard (cardId, { deck, fields, tags }) {
    return ankiCall('card_update', {
        cardId: cardId,
        deck: deck,
        fields: fields,
        tags: tags,
    });
}
