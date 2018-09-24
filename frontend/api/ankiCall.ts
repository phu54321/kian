// Copyright (C) 2018 Hyun Woo Park
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import io from 'socket.io-client';
import Vue from 'vue';

const apiRoot = 'http://localhost:28735/';
const socket = io(apiRoot);

const syncKeyHeader = Math.random().toString();
let lastSyncKey = 0;

function createSyncKey () {
    return `syncKey_${syncKeyHeader}_${lastSyncKey++}`;
}

const callbackTable = new Map();

interface IResponse {
    syncKey: string;
    [key: string]: any;
}

socket.on('msg', (response: IResponse) => {
    const { syncKey } = response;
    const callback = callbackTable.get(syncKey);
    if (!callback) return;

    const { resolve, reject } = callback;
    callbackTable.delete(syncKey);

    if (response.error) return reject(new Error(response.error.toString()));
    return resolve(response.result);
});

export default function ankiCall (apiType: string, data: any) {
    return new Promise<any>((resolve, reject) => {
        const syncKey = createSyncKey();
        callbackTable.set(syncKey, { resolve, reject });
        socket.emit('msg', {
            apiType,
            syncKey,
            ...data,
        });
    });
}

Vue.prototype.$ankiCall = ankiCall;
