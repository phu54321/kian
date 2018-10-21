import ankiCall from '../ankiCall'
import { addDeck, hasDeck } from './deck'
import { pleuralize, unpleuralize } from '@/utils/pleuralize'

interface INoteDef {
  deck: string
  model: string
  fields: string
  tags: string
}

/**
 * Add note to databsae
 */
export async function addNote (noteDef: INoteDef) {
  const { deck, model, fields, tags } = noteDef
  if (!(await hasDeck(deck))) await addDeck(deck)
  return ankiCall('note_add', {
    deck,
    model,
    fields,
    tags
  })
}

/**
 * Get card information by ID
 */
export async function getCardById (cardId: number[] | number) {
  const [cardIds, isPleural] = pleuralize(cardId)
  const cards = await Promise.all(cardIds.map(cardId => ankiCall('card_get', { cardId })))
  return unpleuralize(cards, isPleural)
}

export async function queryCardIds (param?: {
  query: string,
  sortBy: string,
  sortOrder: string
}) {
  const { query, sortBy, sortOrder }: {
    query ?: string,
    sortBy ?: string,
    sortOrder ?: string
  } = param || {}

  return ankiCall('browser_query', {
    query: query || '',
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc'
  })
}

export enum SchedType {
  New,
  Learn,
  Review,
  NotScheduled
}
interface ICardBrowserInfo {
  id: number
  noteId: number
  deck: string
  model: string
  ord: number
  preview: string
  tags: string[]
  createdAt: number
  updatedAt: number
  due: number
  schedType: SchedType
  suspended: boolean
}

export async function getCardsBrowserInfo (cardIds: number[]): Promise<ICardBrowserInfo[]> {
  const cards = await ankiCall('browser_get_batch', {
    cardIds
  })
  return cards.map((card: any) => ({
    id: card.id,
    noteId: card.noteId,
    deck: card.deck,
    model: card.model,
    ord: card.ord,
    preview: card.preview,
    tags: card.tags,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    due: card.due,
    schedType:
    (card.schedType === 'new') ? SchedType.New :
      (card.schedType === 'lrn') ? SchedType.Learn :
      (card.schedType === 'rev') ? SchedType.Review :
      SchedType.NotScheduled,
    suspended: card.suspended
  }))
}

export async function updateCard (cardId: number, { deck, fields, tags }: INoteDef) {
  return ankiCall('card_update', {
    cardId,
    deck,
    fields,
    tags
  })
}

export async function updateCardDeckBatch (cardIds: number[], deck: string) {
  if (!(await hasDeck(deck))) await addDeck(deck)
  return ankiCall('card_update_deck_batch', { cardIds, deck })
}

export async function updateCardModelBatch (cardIds: number[], model: string) {
  return ankiCall('card_update_model_batch', { cardIds, model })
}

export async function addCardTagBatch (cardIds: number[], tags: string[] | string) {
  if (typeof tags === 'string') tags = [tags]
  return ankiCall('card_add_tag_batch', { cardIds, tags })
}

export async function deleteCardTagBatch (cardIds: number[], tags: string[] | string) {
  if (typeof tags === 'string') tags = [tags]
  return ankiCall('card_remove_tag_batch', { cardIds, tags })
}

export async function deleteCard (cardIds: number[] | number) {
  cardIds = pleuralize(cardIds)[0]
  return ankiCall('card_delete_batch', { cardIds })
}

export async function toggleCardMarkedBatch (cardIds: number[]) {
  return ankiCall('card_toggle_marked_batch', { cardIds })
}

export async function toggleCardSuspendedBatch (cardIds: number[]) {
  return ankiCall('card_toggle_suspendeded_batch', { cardIds })
}
