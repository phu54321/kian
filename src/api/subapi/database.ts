import ankiCall from '../ankiCall'

export function getEmptyCards () {
  return ankiCall('col_emptycards_get')
}

export function checkDatabase () {
  return ankiCall('col_check')
}

export interface DeckDueTreeLeaf {
  name: string
  fullname: string
  newCount: number
  lrnCount: number
  revCount: number
  subDecks: DeckDueTree
  collapsed: boolean
}

export type DeckDueTree = DeckDueTreeLeaf[]

export function getDueTree (): Promise<DeckDueTree> {
  return ankiCall('dashboard_deck_tree')
}
