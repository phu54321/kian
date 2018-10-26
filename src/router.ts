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

import Vue from 'vue'
import Router, { RouteConfig, Route } from 'vue-router'

import routes from 'vue-auto-routing'
import { Component } from 'vue-router/types/router'
import { createRouterLayout } from 'vue-router-layout'

Vue.use(Router)

const RouterLayout = createRouterLayout(layout => {
  return import('@/layouts/' + layout + '.vue')
})

/** Type-cast route.parameter based on component's property definition. */
function propEnableRouteEntry (route: RouteConfig) {
  const propsHandler = (route: Route) => {
    const lastRouteEntry = route.matched[route.matched.length - 1]
    const component = lastRouteEntry.components.default
    // Component may be dynamic imports, which then would make `component.props` invalid.
    // We'll check that case later. Just assume `props` exists on component for now.
    const props = (component as any).props
    const typeCastedParams = Object.assign({}, route.params)
    if (props) { // Component is a real ComponentOptions
      Object.keys(props).forEach(k => {
        if (typeCastedParams[k] === undefined) return
        const propType = props[k].type
        if (propType) typeCastedParams[k] = propType(typeCastedParams[k])
      })
    } else { // Maybe dynamic imports?
      for (const k of Object.keys(typeCastedParams)) {
        const oldParam = typeCastedParams[k]
        let newParam: any
        if (/-?\d+/.test(oldParam)) newParam = Number(oldParam)
        typeCastedParams[k] = newParam
      }
    }
    console.log(route.params, props, typeCastedParams)
    return typeCastedParams
  }
  return Object.assign({ props: propsHandler }, route)
}

const propEnabledRoutes: RouteConfig[] = routes.map(propEnableRouteEntry)

/** Add a path to main router */
export function MainRouterAdd (path: string, component: Component) {
  propEnabledRoutes.push(propEnableRouteEntry({
    path,
    component
  }))
}

/**
 * Create a router
 *
 * @description
 * Note that rather than exporting a router object itself, we export createRouter
 * function instead. This is because addons may add additional routes via
 * `MainRouterAdd`, and router should be created after all addons have added
 * their routes.
 */
export function createRouter () {
  propEnabledRoutes.push({
    path: '*',
    redirect: '/404'
  })

  // vue-cli-auto-routing returns nested router. Respect that.
  const router = new Router({
    routes: [
      {
        path: '/',
        component: RouterLayout,
        children: propEnabledRoutes
      }
    ]
  })

  return router
}
