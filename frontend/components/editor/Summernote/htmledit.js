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

import { addHotkey, addFunctions } from './summernoteExtend';
import $ from 'jquery';

addHotkey({
    'CTRL+SHIFT+X': 'toggleCodeView',
});

addFunctions ({
    toggleCodeView () {
        const editorContext = this.context;
        editorContext.invoke('codeview.toggle');
        this.$editor.prepend($('<div></div>')
            .text('Quit codeview')
            .addClass('codeview-exit')
            .on('click', function () {
                $(this).remove();
                editorContext.invoke('codeview.toggle');
            })
        );
    },
});
