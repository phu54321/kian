import ankiCall from './ankiCall';

let modelListCache = null;

export async function getModel (modelName) {
    return ankiCall('model_get', {
        modelName
    });
}

export async function listModel () {
    if(!modelListCache) {
        modelListCache = await ankiCall('model_list');
    }
    return modelListCache;
}
