import io from 'socket.io-client';

const apiRoot = 'http://localhost:28735/';

const socket = io(apiRoot);

const syncKeyHeader = Math.random().toString();
let lastSyncKey = 0;

function createSyncKey () {
    return `syncKey_${syncKeyHeader}_${lastSyncKey++}`;
}

const msgTable = {};

socket.on('msg', response => {
    const syncKey = response.syncKey;
    const { resolve, reject } = msgTable[syncKey];
    msgTable[syncKey] = undefined;

    if(response.error) return reject(new Error(response.error.toString()));
    return resolve(response.result);
});

export function ankiCall (apiType, data) {
    return new Promise((resolve, reject) => {
        const syncKey = createSyncKey();
        msgTable[syncKey] = { resolve, reject };
        socket.emit('msg', {
            syncKey,
            apiType,
            ...data
        });    
    });
}

