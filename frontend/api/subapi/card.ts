import _ from 'lodash';
import ankiCall from '../ankiCall';
import { addDeck, hasDeck } from './deck';

interface INoteDef {
    deck: string;
    model: string;
    fields: string;
    tags: string;
}

export async function addNote (noteDef: INoteDef) {
    const { deck, model, fields, tags } = noteDef;
    if (!(await hasDeck(deck))) await addDeck(deck);
    return ankiCall('note_add', {
        deck,
        model,
        fields,
        tags,
    });
}

export async function getCard (cardId: number) {
    return ankiCall('card_get', { cardId });
}

export async function updateCard (cardId: number, { deck, fields, tags }: INoteDef) {
    return ankiCall('card_update', {
        cardId,
        deck,
        fields,
        tags,
    });
}

export async function updateCardDeckBatch (cardIds: number[], deck: string) {
    if (!(await hasDeck(deck))) await addDeck(deck);
    return ankiCall('card_update_deck_batch', { cardIds, deck });
}

export async function updateCardModelBatch (cardIds: number[], model: string) {
    return ankiCall('card_update_model_batch', { cardIds, model });
}

export async function addCardTagBatch (cardIds: number[], tags: string[] | string) {
    if (typeof tags === 'string') tags = [tags];
    return ankiCall('card_add_tag_batch', { cardIds, tags });
}

export async function deleteCardTagBatch (cardIds: number[], tags: string[] | string) {
    if (typeof tags === 'string') tags = [tags];
    return ankiCall('card_remove_tag_batch', { cardIds, tags });
}

export async function deleteCardBatch (cardIds: number[]) {
    return ankiCall('card_delete_batch', { cardIds });
}

export async function toggleCardMarkedBatch (cardIds: number[]) {
    return ankiCall('card_toggle_marked_batch', { cardIds });
}

export async function toggleCardSuspendedBatch (cardIds: number[]) {
    return ankiCall('card_toggle_suspendeded_batch', { cardIds });
}
