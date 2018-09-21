import ankiCall from '../ankiCall';
import LRUCached from '~/utils/lrucache';

let modelListCache = null;

export const getModel = LRUCached(async function (modelName) {
    return ankiCall('model_get', {
        modelName
    });
}, 5);

export async function listModel () {
    if(!modelListCache) {
        modelListCache = await ankiCall('model_list');
    }
    return modelListCache;
}
