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

import { createDecorator } from 'vue-class-component'
import Vue from 'vue'

export default function AsyncComputed (options: {
  default?: any,
  watch?: (this: any) => any
} = {}) {
  const defValue = options.default || null
  const watch = options.watch || null

  return createDecorator((componentOptions: any, key: string) => {
    const oldMethod = componentOptions.computed[key].get
    delete componentOptions.computed[key]

    if (!componentOptions.asyncComputed) componentOptions.asyncComputed = {}
    const asyncComputedEntry: any = { get: oldMethod }
    if (defValue) asyncComputedEntry.default = defValue
    if (watch) asyncComputedEntry.watch = watch

    componentOptions.asyncComputed[key] = asyncComputedEntry
  })
}
