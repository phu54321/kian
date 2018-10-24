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

// This code is intented to be run on webpack-side, so it uses webpack's require
// context to get all addons.

const addonMainContext = require.context('../../addons/', true, /addonMain.(ts|js)$/)
for (const addonName of addonMainContext.keys()) {
  const addonMain = addonMainContext(addonName).default
  if (addonMain && addonMain.install) addonMain.install()
  else {
    // eslint-disable-next-line no-console
    console.error(`Addon ${addonName} don't have install() method.`)
  }
}
