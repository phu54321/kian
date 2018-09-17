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

const Jimp = require('jimp');

Jimp.prototype.padWhite = function (padding) {
    const {width, height} = this.bitmap;
    const newImage = new Jimp(width + padding * 2, height + padding * 2, 0xFFFFFFFF);
    newImage.blit(this, padding, padding);
    return newImage;
};


function isHorizontalLineWhite (data, width, y) {
    const dataIndexStart = width * y * 4;
    const dataIndexEnd = dataIndexStart + width * 4;
    for(let i = dataIndexStart ; i < dataIndexEnd ; i += 4) {
        if(data.readUInt32BE(i) !== 0xFFFFFFFF) return false;
    }
    return true;
}

function isVerticalLine (data, width, height, x) {
    const dataIndexStart = x * 4;
    const step = width * 4;
    const dataIndexEnd = dataIndexStart + step * height;

    const y0Color = data.readUInt32BE(dataIndexStart);
    const {r, g, b} = Jimp.intToRGBA(y0Color);
    if(r > 0x80 || g > 0x80 || b > 0x80) return false;

    for(let i = dataIndexStart + step ; i < dataIndexEnd ; i += step) {
        if(data.readUInt32BE(i) !== y0Color) return false;
    }
    return true;
}


export function parseQAPair (image) {
    const qaPair = [];

    // y-split things
    const {data, width, height} = image.bitmap;

    // Split by white horizontal lines
    const isYLineWhite = [];
    for(let y = 0 ; y < height ; y++) {
        isYLineWhite.push(isHorizontalLineWhite(data, width, y));
    }

    const imgBlockYRange = [];
    let lastY = -1;
    for(let y = 0 ; y < height ; y++) {
        if(!isYLineWhite[y] && lastY === -1) lastY = y;
        else if(isYLineWhite[y] && lastY !== -1) {
            imgBlockYRange.push([lastY, y + 1]);
            lastY = -1;
        }
    }

    const XPADDING = 3, YPADDING = 3;
    imgBlockYRange.forEach(([y0, y1]) => {
        const cropHeight = y1 - y0 - 2 * YPADDING;
        if(cropHeight <= 0) return;

        const cropped = image.clone().crop(0, y0 + YPADDING, width, cropHeight).autocrop();

        const {
            data: croppedData,
            width: croppedWidth,
            height: croppedHeight,
        } = cropped.bitmap;
        // Find vertical line.


        let minLineX = -1;
        for(let x = 0 ; x < croppedWidth ; x++) {
            if(isVerticalLine(croppedData, croppedWidth, cropHeight, x)) {
                if(minLineX !== -1 && minLineX !== x - 1) return;
                minLineX = x;
            }
        }
        if(minLineX === -1) return;  // No vertical line

        const questionImg = cropped.clone()
            .crop(0, 0, minLineX - XPADDING, croppedHeight)
            .padWhite(1).autocrop().padWhite(20);
        const answerImg = cropped.clone()
            .crop(minLineX + XPADDING, 0, croppedWidth - minLineX - XPADDING, croppedHeight)
            .padWhite(1).autocrop().padWhite(20);

        // Ignore some too-small-for-qapair images
        if(questionImg.bitmap.height < 60 && answerImg.bitmap.height < 60) {
            return;
        }
        qaPair.push([questionImg, answerImg]);
    });
    return qaPair;
}
