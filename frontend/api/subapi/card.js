import ankiCall from '../ankiCall';
import { hasDeck, addDeck } from './deck';
import _ from 'lodash';

export async function addNote ({ deck, model, fields, tags }) {
    if (!(await hasDeck(deck))) await addDeck(deck);
    return ankiCall('note_add', {
        deck,
        model,
        fields,
        tags
    });
}

export async function getCard (cardId) {
    return ankiCall('card_get', { cardId });
}

export async function updateCard (cardId, { deck, fields, tags }) {
    return ankiCall('card_update', {
        cardId,
        deck,
        fields,
        tags,
    });
}

export async function updateCardDeckBatch (cardIds, deck) {
    if (!(await hasDeck(deck))) await addDeck(deck);
    return ankiCall('card_update_deck_batch', { cardIds, deck });
}

export async function updateCardModelBatch (cardIds, model) {
    return ankiCall('card_update_model_batch', { cardIds, model });
}

export async function addCardTagBatch (cardIds, tags) {
    if (_.isString(tags)) tags = [tags];
    return ankiCall('card_add_tag_batch', { cardIds, tags });
}

export async function deleteCardTagBatch (cardIds, tags) {
    if (_.isString(tags)) tags = [tags];
    return ankiCall('card_remove_tag_batch', { cardIds, tags });
}

export async function deleteCardBatch (cardIds) {
    return ankiCall('card_delete_batch', { cardIds });
}


export async function toggleCardMarkedBatch (cardIds) {
    return ankiCall('card_toggle_marked_batch', { cardIds });
}

export async function toggleCardSuspendedBatch (cardIds) {
    return ankiCall('card_toggle_suspendeded_batch', { cardIds });
}

