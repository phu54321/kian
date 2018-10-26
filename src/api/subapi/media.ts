import ankiCall from '../ankiCall'
import { pleuralize } from '@/utils/pleuralize'

/**
 * Upload media to anki media storage!
 *
 * @param filename Filename of uploaded data
 * @param datab64  base64-encoded file data
 * @returns Stored filename
 */
export function mediaUpload (filename: string, datab64: string): Promise<string> {
  return ankiCall('media_upload', {
    datab64,
    filename
  })
}

/**
 * `Check media` function of Anki.
 */
export function checkMedia (): Promise<{
  missing: string[]
  unused: string[]
}> {
  return ankiCall('media_check')
}

/**
 * Delete specified medias.
 *
 * @returns Media failed to delete
 */
export function mediaDelete (filenames: string[] | string): Promise<number> {
  filenames = pleuralize(filenames)[0]
  return ankiCall('media_remove', { filenames })
}
