import ankiCall from '../ankiCall'

export function getEmptyCards () {
  return ankiCall('col_emptycards_get')
}

export function checkMedia () {
  return ankiCall('media_check')
}

export function checkDatabase () {
  return ankiCall('col_check')
}

export function getDeckDueTree () {
  return ankiCall('dashboard_deck_tree')
}
