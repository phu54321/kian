import ankiCall from '../ankiCall'
import { SchedType } from './card'

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

export async function queryCardIds (param: {
  query: string,
  sortBy?: string,
  sortOrder?: string
} = { query: '' }) {
  const { query, sortBy, sortOrder } = param

  return ankiCall('browser_query', {
    query: query || '',
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc'
  })
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
    (card.schedType === 'new') ? SchedType.New
      : (card.schedType === 'lrn') ? SchedType.Learn
        : (card.schedType === 'rev') ? SchedType.Review
          : SchedType.NotScheduled,
    suspended: card.suspended
  }))
}
