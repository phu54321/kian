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
import routes from 'vue-auto-routing';

const newRoutes = routes.map(route => Object.assign({props: true}, route));
newRoutes.push({
    path: '*',
    redirect: '/',
});

Vue.use(Router);
Vue.use(routerHistory);

const router = new Router({
    routes: newRoutes
});

router.afterEach(writeHistory);

export default router;
