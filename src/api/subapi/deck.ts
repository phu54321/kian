import ankiCall from '../ankiCall'

let deckListCache: string[] = []

export interface DeckDue {
  newCount: number
  lrnCount: number
  revCount: number
}
export function DeckDueZero (): DeckDue {
  return { newCount: 0, lrnCount: 0, revCount: 0 }
}

export async function listDeck (): Promise<string[]> {
  if (!deckListCache.length) {
    deckListCache = await ankiCall('deck_list')
  }
  return deckListCache
}

export function setCurrentDeck (deck: string) {
  return ankiCall('config_set_current_deck', { deck })
}

export async function hasDeck (deckName: string) {
  const deckList = await listDeck()
  return (deckList.indexOf(deckName) !== -1)
}

export async function addDeck (deckName: string) {
  if (await hasDeck(deckName)) return false

  await ankiCall('deck_add', {
    deckName
  })
  deckListCache.push(deckName)
  return true
}

export async function getDeckInfo (deckName: string) {
  return ankiCall('deck_info', {
    deckName
  })
}

export function collapseDeck (deckName: string, collapse: boolean) {
  return ankiCall('deck_collapse', {
    deckName,
    collapse
  })
}
