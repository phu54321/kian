const Jimp = require('jimp');

Jimp.prototype.padWhite = function (padding) {
    const {width, height} = this.bitmap;
    const newImage = new Jimp(width + padding * 2, height + padding * 2, 0xFFFFFFFF);
    newImage.blit(this, padding, padding);
    return newImage;
};


export function parseQAPair (image) {
    const qaPair = [];

    // y-split things
    const {data, width, height} = image.bitmap;

    // Split by white horizontal lines
    const isYLineWhite = [];
    for(let y = 0 ; y < height ; y++) {
        let x;
        for(x = 0 ; x < width ; x++) {
            const index = image.getPixelIndex(x, y);
            const r = data[index + 0];
            const g = data[index + 1];
            const b = data[index + 2];
            if(!(r === 0xFF && g === 0xFF && b === 0xFF)) break;
        }
        isYLineWhite.push(x === width);
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
        const cropped = image.clone().crop(0, y0 + YPADDING, width, y1 - y0 - 2 * YPADDING).autocrop();

        const {
            data: croppedData,
            width: croppedWidth,
            height: croppedHeight
        } = cropped.bitmap;
        // Find vertical line.

        let minLineX = -1;
        for(let x = 0 ; x < croppedWidth ; x++) {
            const x0Index = image.getPixelIndex(x, 0);
            const r = croppedData[x0Index + 0], g = croppedData[x0Index + 1], b = croppedData[x0Index + 2];
            if(r > 0x80 || g > 0x80 || b > 0x80) continue;

            let y;
            for(y = 1 ; y < croppedHeight ; y++) {
                const index = image.getPixelIndex(x, 0);
                if(
                    r !== croppedData[index + 0] ||
                    g !== croppedData[index + 1] ||
                    b !== croppedData[index + 2]
                ) break;
            }
            if(y !== croppedHeight) continue;

            if(minLineX === -1) minLineX = x;
            else if(minLineX !== x - 1) return;  // Vertical line not unique
        }
        if(minLineX === -1) return;  // No vertical line

        const questionImg = cropped.clone()
            .crop(0, 0, minLineX - XPADDING, croppedHeight)
            .padWhite(1).autocrop().padWhite(20);
        const answerImg = cropped.clone()
            .crop(minLineX + XPADDING, 0, croppedWidth - minLineX - XPADDING, croppedHeight)
            .padWhite(1).autocrop().padWhite(20);

        qaPair.push([questionImg, answerImg]);
    });
    return qaPair;
}
