import ankiCall from '../ankiCall'
import { DeckDue } from './deck'

export function getEmptyCards () {
  return ankiCall('col_emptycards_get')
}

export function checkDatabase () {
  return ankiCall('col_check')
}

export interface DeckTreeLeaf {
  name: string
  fullname: string
  due: DeckDue
  subDecks: DeckTree
  collapsed: boolean
}

export type DeckTree = DeckTreeLeaf[]

export function getDueTree () {
  return ankiCall('dashboard_deck_tree')
}
