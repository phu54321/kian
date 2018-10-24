import ankiCall from '../ankiCall'
import { addDeck, hasDeck } from './deck'
import { pleuralize, unpleuralize } from '@/utils/pleuralize'

interface NoteDef {
  deck: string
  model: string
  fields: string
  tags: string
}

export enum SchedType {
  New,
  Learn,
  Review,
  NotScheduled
}

/**
 * Add note to databsae
 */
export async function addNote (noteDef: NoteDef) {
  const { deck, model, fields, tags } = noteDef
  if (!(await hasDeck(deck))) await addDeck(deck)
  return ankiCall('note_add', {
    deck,
    model,
    fields,
    tags
  })
}

export async function getCard (cardId: number[] | number) {
  const [cardIds, isPleural] = pleuralize(cardId)
  const cards = await Promise.all(cardIds.map(cardId => ankiCall('card_get', { cardId })))
  return unpleuralize(cards, isPleural)
}

export async function deleteCard (cardIds: number[] | number) {
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_delete_batch', { cardIds })
}

export async function updateCard (cardId: number, { deck, fields, tags }: NoteDef) {
  return ankiCall('card_update', { cardId, deck, fields, tags })
}

export async function updateCardDeck (cardIds: number[] | number, deck: string) {
  if (!(await hasDeck(deck))) await addDeck(deck)
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_update_deck_batch', { cardIds, deck })
}

export async function updateCardModel (cardIds: number[], model: string) {
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_update_model_batch', { cardIds, model })
}

export async function addCardTag (cardIds: number[], tags: string[] | string) {
  if (typeof tags === 'string') tags = [tags]
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_add_tag_batch', { cardIds, tags })
}

export async function deleteCardTag (cardIds: number[], tags: string[] | string) {
  if (typeof tags === 'string') tags = [tags]
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_remove_tag_batch', { cardIds, tags })
}

export async function toggleCardMarked (cardIds: number[] | number) {
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_toggle_marked_batch', { cardIds })
}

export async function toggleCardSuspended (cardIds: number[] | number) {
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_toggle_suspendeded_batch', { cardIds })
}
