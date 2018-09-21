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
