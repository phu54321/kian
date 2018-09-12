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

import { wrap } from './common';
import { addHotkey, addFunctions } from './summernoteExtend';
import { getLastClozeId } from '../utils/cloze';

addHotkey({
    'CTRL+SHIFT+C': 'newCloze',
    'CTRL+SHIFT+ALT+C': 'sameCloze',
    'CTRL+SHIFT+F': 'lineCloze',
});

addFunctions({
    newCloze () {
        const code = this.context.invoke('code');
        const lastClozeId = getLastClozeId(code);
        const thisClozeId = lastClozeId + 1;
        this.beforeCommand();
        wrap(`{{c${thisClozeId}::`, '}}');
        this.afterCommand();
    },
    sameCloze () {
        const code = this.context.invoke('code');
        const lastClozeId = getLastClozeId(code);
        const thisClozeId = lastClozeId || 1;
        this.beforeCommand();
        wrap(`{{c${thisClozeId}::`, '}}');
        this.afterCommand();
    },
    lineCloze () {
        const code = this.context.invoke('code');
        const lastClozeId = getLastClozeId(code);
        const thisClozeId = lastClozeId || 1;
        this.beforeCommand();
        wrap(`{{c${thisClozeId}::`, '}}');
        this.afterCommand();
    },
});
