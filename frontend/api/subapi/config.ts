import ankiCall from '../ankiCall'

export function getAnkiConfig () {
  return ankiCall('config_get')
}
