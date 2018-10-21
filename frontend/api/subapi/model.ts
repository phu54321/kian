import LRUCached from '@/utils/lrucache'
import ankiCall from '../ankiCall'

let modelListCache: string[] = []

export const getModel = LRUCached(async (modelName: string) => {
  return ankiCall('model_get', {
    modelName
  })
}, 5)

export async function listModel () {
  if (!modelListCache.length) {
    modelListCache = await ankiCall('model_list')
  }
  return modelListCache
}

export function setCurrentModel (model: string) {
  return ankiCall('config_set_current_model', { model })
}
