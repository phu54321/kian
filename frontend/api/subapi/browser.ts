import ankiCall from '../ankiCall';

export async function findCards (param?: {
    query: string,
    sortBy: string,
    sortOrder: string,
}) {
    const { query, sortBy, sortOrder }: {
        query ?: string,
        sortBy ?: string,
        sortOrder ?: string,
    } = param || {};

    return ankiCall('browser_query', {
        query: query || '',
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
    });
}

export async function getCardsBrowserInfo (cardIds: number[]) {
    return ankiCall('browser_get_batch', {
        cardIds,
    });
}
