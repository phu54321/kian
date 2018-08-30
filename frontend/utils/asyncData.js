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

import ErrorDialog from '../components/ErrorDialog';

function translateParamsToProps (to) {
    const routeMatches = to.matched;
    const params = to.params;
    const lastRoute = routeMatches[routeMatches.length - 1];
    const routeProps = lastRoute.props.default;

    if(routeProps === true) {
        const targetProps = lastRoute.components.default.props;
        const props = {};

        // Match types to target component's typing system, if possible.
        if(targetProps) {
            Object.keys(targetProps).forEach(propName => {
                const targetProp = targetProps[propName];
                const targetPropType = targetProp.type;
                if(targetPropType === null) props[propName] = params[propName];
                else props[propName] = targetPropType(params[propName]);
            });
        }
        return props;
    }
    else if(typeof routeProps === 'function') {
        return routeProps(to);
    }
}

export default function asyncData (loadData, callback) {
    return {
        // asyncDataTrap prevents beforeRouteEnter and created from both manipulating the data.
        props: ['$asyncDataTrap'],
        created () {
            if (this.$route.params.$asyncDataTrap) {
                this.$route.params.$asyncDataTrap = false;
                return;
            }
            loadData(this).then(d => {
                Object.assign(this.$data, d);
                if(callback) callback.apply(this);
            });
        },
        beforeRouteEnter (to, from, next) {
            const toProps = translateParamsToProps(to);
            loadData(toProps).then(data => {
                to.params.$asyncDataTrap = true;
                next(vm => {
                    Object.assign(vm.$data, data);
                    if(callback) callback.apply(this);
                });
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
                next(false);
            });
        },
        beforeRouteUpdate (to, from, next) {
            const toProps = translateParamsToProps(to);
            loadData(toProps).then(data => {
                Object.assign(this.$data, data);
                if(callback) callback.apply(this);
                next();
            }).catch(err => {
                ErrorDialog.openErrorDialog(null, err.message);
                next(false);
            });
        },
    };
}
