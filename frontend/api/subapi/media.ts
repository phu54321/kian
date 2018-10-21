import ankiCall from '../ankiCall'
import { pleuralize } from '@/utils/pleuralize'

export function mediaUpload (filename: string, datab64: string) {
  return ankiCall('media_upload', {
    datab64,
    filename
  })
}

export function checkMedia () {
  return ankiCall('media_check')
}

export function mediaDelete (filenames: string[] | string) {
  filenames = pleuralize(filenames)[0]
  return ankiCall('media_remove', { filenames })
}
