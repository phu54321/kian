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

import { addHook } from '@/utils/hookBase'

const modelName = 'Cloze (overlapping)'

export default {
  install () {
    addHook('edit_card_load', card => {
      const { model, fields } = card
      if (model === modelName) {
        card.fieldFormats = card.fieldFormats.map(fFormat => {
          if (/Text(\d+)/.test(fFormat.name) || fFormat.name === 'Full') {
            fFormat.hidden = true
          }
          return fFormat
        })

        const newFields = fields.slice()
        newFields[0] = fields[0].replace(
          /\[\[oc(\d+)::(.+?)]]/g,
          (...matches) => `{{c${matches[1]}::${matches[2]}}}`
        )
        card.fields = newFields
      }
      return card
    })

    addHook('edit_card_save', card => {
      const { model } = card
      if (model === modelName) {
        const fields = card.fields.slice()
        const mainField = fields[0]

        for (let i = 0; i < fields.length; i++) {
          const fFormat = card.fieldFormats[i]
          if (/Text(\d+)/.test(fFormat.name)) {
            const thisFieldIndex = fFormat.name.slice(4) | 0
            let hasMatchingField = false

            fields[i] = mainField.replace(
              /\{\{c(\d+)::(.+?)(::(.+?))?\}\}/g,
              (...matches) => {
                const clozeIdx = matches[1] | 0
                if (clozeIdx === thisFieldIndex) {
                  hasMatchingField = true
                  return matches[0]
                } else if (clozeIdx === thisFieldIndex - 1) return matches[2]
                else return matches[3] ? matches[4] : '...'
              }
            )
            if (!hasMatchingField) fields[i] = ''
          }
        }

        fields[0] = fields[0].replace(
          /\{\{c(\d+)::(.+?)\}\}/g,
          (...matches) => `[[oc${matches[1]}::${matches[2]}]]`
        )

        card.fields = fields
      }
      return card
    })
  }
}
