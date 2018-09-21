import ankiCall from '../ankiCall';

export async function findCards (param) {
    const { query, sortBy, sortOrder } = param || {};

    return await ankiCall('browser_query', {
        query: query || '',
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
    });
}

export async function getCardsBrowserInfo (cardIds) {
    return await ankiCall('browser_get_batch', {
        cardIds
    });
}
