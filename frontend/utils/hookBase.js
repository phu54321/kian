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

const hookMap = {};

export function addHook (hookID, handler) {
    let handlerList = hookMap[hookID];
    if(!handlerList) hookMap[hookID] = handlerList = [];
    handlerList.push(handler);
}

export function removeHook (hookID, handler) {
    const handlerList = hookMap[hookID];
    if(!handlerList) return;
    const handlerIdx = handlerList.indexOf(handler);
    if(handlerIdx === -1) return;
    handlerList.splice(handlerIdx, 1);
}

export function runHook (hookID, msg) {
    const handlerList = hookMap[hookID];
    if(!handlerList) return msg;

    for(let i = 0 ; i < handlerList.length ; i++) {
        const handler = handlerList[i];
        msg = handler(msg);
        if(!msg) return null;
    }
    return msg;
}
