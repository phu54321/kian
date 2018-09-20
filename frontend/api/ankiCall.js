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

const msgTable = {};

socket.on('msg', response => {
    const syncKey = response.syncKey;
    const { resolve, reject } = msgTable[syncKey];
    msgTable[syncKey] = undefined;

    if(response.error) return reject(new Error(response.error.toString()));
    return resolve(response.result);
});

export default function ankiCall (apiType, data) {
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

Vue.prototype.$ankiCall = ankiCall;

