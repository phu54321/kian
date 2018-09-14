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

import routes from 'vue-auto-routing';

function propEnableRouteEntry (route) {
    const propsHandler = (route) => {
        // Type-cast route.parameter based on component's property definition.
        const component = route.matched[route.matched.length - 1].components.default;
        const props = component.props;
        const typeCastedParams = Object.assign({}, route.params);
        if(props) {
            Object.keys(props).forEach(k => {
                if(typeCastedParams[k] === undefined) return;
                const propType = props[k].type || (x => x);
                typeCastedParams[k] = propType(typeCastedParams[k]);
            });
        }
        return typeCastedParams;
    };
    return Object.assign({props: propsHandler}, route);
}

const propEnabledRoutes = routes.map(propEnableRouteEntry);

export default {
    add (path, component) {
        propEnabledRoutes.push(propEnableRouteEntry({
            path,
            component
        }));
    },

    createRouter () {
        propEnabledRoutes.push({
            path: '*',
            redirect: '/',
        });

        const router = new Router({
            routes: propEnabledRoutes
        });

        router.afterEach(writeHistory);
        return router;
    }
};
