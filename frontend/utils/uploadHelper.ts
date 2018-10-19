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

import ankiCall from '~/api/ankiCall'

function base64ArrayBuffer (arrayBuffer: ArrayBuffer) {
  let base64 = ''
  const encodings =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  const bytes = new Uint8Array(arrayBuffer)
  const byteLength = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength = byteLength - byteRemainder

  let a
  let b
  let c
  let d
  let chunk

    // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63 // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

    // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

export function getFileAsBase64 (file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = () => {
      resolve(base64ArrayBuffer(reader.result as ArrayBuffer))
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}

function toHexString (byteArray: Uint8Array) {
  return Array.prototype.map.call(byteArray, (byte: number) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('')
}

export function getRandomFilename (filename: string) {
    // Because filename might be case-insensitive, we cannot use base64 or nanoids.
    // We just generate a random hexadecimal string w/ Web crypto library.
  const crypto = window.crypto || (window as any).msCrypto

  const lastDotIndex = filename.lastIndexOf('.')
  const randomHex = toHexString(crypto.getRandomValues(new Uint8Array(8)))

  if (lastDotIndex !== -1) {
    return randomHex + filename.substr(lastDotIndex)
  } else {
    return randomHex
  }
}

export async function uploadImageFromBase64 (filename: string, datab64: string) {
  filename = getRandomFilename(filename)

  return ankiCall('media_upload', {
    datab64,
    filename
  })
}
