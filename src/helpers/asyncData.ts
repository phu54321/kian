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
import Component from 'vue-class-component'

// Note: vue-router has to be registered **before** importing asyncData,
// because vue-router's route guards merge options should be used before
// asyncData registers its global mixins.
import VueRouter, { Route } from 'vue-router'
import * as RouterTypes from 'vue-router/types/router'
type RouterComponent = RouterTypes.Component

Vue.use(VueRouter)

function componentFromRoute (route: Route): RouterComponent {
  const routeMatches = route.matched
  const lastRoute = routeMatches[routeMatches.length - 1]
  return lastRoute.components.default
}

function translateParamsToProps (to: Route) {
  const routeMatches = to.matched
  const params = to.params
  const lastRoute = routeMatches[routeMatches.length - 1]

  const routeProps = (lastRoute.props as any).default

  if (routeProps === true) {
    const targetProps = (lastRoute.components.default as any).props
    const props: { [key: string]: any } = {}

    // Match types to target component's typing system, if possible.
    if (targetProps) {
      Object.keys(targetProps).forEach(propName => {
        const targetProp = targetProps[propName]
        const targetPropType = targetProp.type
        if (targetPropType === null) props[propName] = params[propName]
        else props[propName] = targetPropType(params[propName])
      })
    }
    return props
  } else if (typeof routeProps === 'function') {
    return routeProps(to)
  }
}

const baseThis = Object.freeze({
  // Add additional props here
})

const asyncMixin = Vue.extend({
  props: ['$asyncDataTrap'],
  // I'm tired of fixing typing errors.
  // TODO: Replace this 'any' with something meaningful
  created (this: any) {
    const asyncData = this.$options.asyncData
    if (!asyncData) return

    if (this.$route.params.$asyncDataTrap) {
      this.$route.params.$asyncDataTrap = ''
      return
    }
    asyncData.call(this, this).then((d: any) => {
      Object.assign(this.$data, d)
    })
  },
  async beforeRouteEnter (to, from, next) {
    const component = (componentFromRoute(to) as any)
    if (!component.asyncData) return next()

    const toProps = translateParamsToProps(to)
    try {
      const data = await component.asyncData.call(baseThis, toProps)
      to.params.$asyncDataTrap = 'true'
      next(vm => {
        Object.assign(vm.$data, data)
      })
    } catch (e) {
      this.$errorDialog('Loading error', e.message)
      next(false)
    }
  },
  async beforeRouteUpdate (to, from, next) {
    const component = (componentFromRoute(to) as any)
    if (!component.asyncData) return next()

    const toProps = translateParamsToProps(to)

    try {
      const data = await component.asyncData.call(baseThis, toProps)
      Object.assign(this.$data, data)
      next()
    } catch (e) {
      this.$errorDialog('Loading error', e.message)
      next(false)
    }
  }
})

Vue.mixin(asyncMixin)

Component.registerHooks(['asyncData'])
declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    asyncData?: (props: Record<string, any>) => Record<string, any>
  }
}
