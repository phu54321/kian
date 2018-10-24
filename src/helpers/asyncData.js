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

import ErrorDialog from '@/components/ErrorDialog'
import Vue from 'vue'

// Note: vue-router has to be registered **before** importing asyncData,
// because vue-router's route guards merge options should be used before
// asyncData registers its global mixins.
import VueRouter from 'vue-router'
Vue.use(VueRouter)

function componentFromRoute (route) {
  const routeMatches = route.matched
  const lastRoute = routeMatches[routeMatches.length - 1]
  return lastRoute.components.default
}

function translateParamsToProps (to) {
  const routeMatches = to.matched
  const params = to.params
  const lastRoute = routeMatches[routeMatches.length - 1]
  const routeProps = lastRoute.props.default

  if (routeProps === true) {
    const targetProps = lastRoute.components.default.props
    const props = {}

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

Vue.mixin({
  props: ['$asyncDataTrap'],
  created () {
    const asyncData = this.$options.asyncData
    if (!asyncData) return

    if (this.$route.params.$asyncDataTrap) {
      this.$route.params.$asyncDataTrap = false
      return
    }
    asyncData.call(this, this).then(d => {
      Object.assign(this.$data, d)
    })
  },
  async beforeRouteEnter (to, from, next) {
    const component = componentFromRoute(to)
    if (!component.asyncData) return next()

    const toProps = translateParamsToProps(to)
    try {
      const data = await component.asyncData.call(baseThis, toProps)
      to.params.$asyncDataTrap = true
      next(vm => {
        Object.assign(vm.$data, data)
      })
    } catch (e) {
      ErrorDialog.openErrorDialog(null, e.message)
      next(false)
    }
  },
  async beforeRouteUpdate (to, from, next) {
    if (!this.asyncData) return next()

    const toProps = translateParamsToProps(to)

    try {
      const data = await this.asyncData.call(baseThis, toProps)
      Object.assign(this.$data, data)
      next()
    } catch (e) {
      ErrorDialog.openErrorDialog(null, e.message)
      next(false)
    }
  }
})