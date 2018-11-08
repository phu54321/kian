import ankiCall from '../ankiCall'

export interface FieldFormat {
  name: string
  sticky: boolean
}

export enum ModelType {
  BASIC,
  CLOZE
}

interface ModelTemplate {
  name: string
  front: string
  back: string
}

export interface ModelDef {
  type: ModelType
  name: string
  templates: ModelTemplate[]
  css: string
  fieldFormats: FieldFormat[]
}

let modelListCache: string[] = []

/**
 * Get model definition
 */
export function getModel (modelName: string): Promise<ModelDef> {
  return ankiCall('model_get', {
    modelName
  })
}

/**
 * List names of models
 */
export async function listModel (): Promise<string[]> {
  if (!modelListCache.length) {
    modelListCache = await ankiCall('model_list')
  }
  return modelListCache
}

export function setCurrentModel (model: string) {
  return ankiCall('config_set_current_model', { model })
}
