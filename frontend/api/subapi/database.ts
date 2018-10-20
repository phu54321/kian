import ankiCall from '../ankiCall'

export function getEmptyCards () {
  return ankiCall('col_emptycards_get')
}

export function checkDatabase () {
  return ankiCall('col_check')
}

export function getDueTree () {
  return ankiCall('dashboard_deck_tree')
}
