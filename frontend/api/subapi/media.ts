import ankiCall from '../ankiCall'
import { pleuralize } from '@/utils/pleuralize'

export function mediaUpload (filename: string, datab64: string) {
  return ankiCall('media_upload', {
    datab64,
    filename
  })
}

export function mediaDelete (filenames: string[] | string) {
  filenames = pleuralize(filenames)
  return ankiCall('media_remove', { filenames })
}
