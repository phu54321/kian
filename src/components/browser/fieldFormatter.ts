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
// along with this program.  If not, see "http://www.gnu.org/licenses/".

import textVersion from 'textversionjs'
import { escapeHtml, formatDate } from '@/utils/utils'
import { SchedType } from '@/api/subapi/card'

export default {
  textVersionJs (text: string) {
    return escapeHtml(textVersion(text, {
      imgProcess (src: string) {
        return src
      }
    }))
  },
  formatOrd (ord: number) {
    return escapeHtml(`#${ord + 1}`)
  },
  timeToText (timestamp: string | number) {
    if (typeof timestamp === 'string') return timestamp
    const date = new Date(timestamp * 1000)
    return formatDate(date)
  },
  concatTags (tags: string[]) {
    return escapeHtml(tags.join(', '))
  },
  schedTypeToDot (type: SchedType): string {
    if (type === SchedType.NotScheduled) return ''
    const typeString = {
      [SchedType.New]: 'new',
      [SchedType.Learn]: 'lrn',
      [SchedType.Review]: 'rev'
    }[type]
    return `<span class='${typeString}Dot'>●</span>`
  }
}
