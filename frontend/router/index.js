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

import Vue from 'vue';
import Router from 'vue-router';
import {
    routerHistory,
    writeHistory
} from 'vue-router-back-button';

Vue.use(Router);
Vue.use(routerHistory);

const router = new Router({
    routes: [
        {
            path: '/',
            component: require('../components/Dashboard').default,
        },
        {
            path: '/deck/:deckName',
            component: require('../components/DeckOverview.vue').default,
            props: true,
        },

        {
            path: '/study/:deckName',
            component: require('../components/Reviewer.vue').default,
            props: true,
        },

        {
            path: '/card/edit/:cardId',
            component: require('../components/CardEdit.vue').default,
            props: route => ({cardId: Number(route.params.cardId)}),
            name: 'card_edit',
        },

        {
            path: '/note/add',
            component: require('../components/NoteAdd.vue').default,
            props: true,
            name: 'note_add',
        },

        {
            path: '/browse',
            component: require('../components/Browser.vue').default,
            props: true,
            name: 'browser',
        },

        {
            path: '*',
            redirect: '/',
        },
    ],
});

router.afterEach(writeHistory);

export default router;
