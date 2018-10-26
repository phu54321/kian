import ankiCall from '../ankiCall'

export function autocompleteTag (query: string): Promise<string[]> {
  return ankiCall('tag_suggestions', { query })
}

export function autocompleteWord (query: string): Promise<string[]> {
  return ankiCall('get_word_autocomplete', { query })
}
