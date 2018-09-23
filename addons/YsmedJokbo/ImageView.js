import Jimp from 'jimp';

class ImageView {
    constructor (img, cropArea) {
        this.img = img;
        this.data = img.bitmap.data;
        this.pitch = img.bitmap.width * 4;

        if (cropArea) {
            this.x0 = cropArea.x;
            this.y0 = cropArea.y;
            this.w = cropArea.w;
            this.h = cropArea.h;
        } else {
            this.x0 = 0;
            this.y0 = 0;
            this.w = img.bitmap.width;
            this.h = img.bitmap.height;
        }
    }

    dataIndex (x, y) {
        return (x + this.x0) * 4 + (y + this.y0) * this.pitch;
    }

    u32col (x, y) {
        return this.data.readUInt32BE(this.dataIndex(x, y));
    }

    crop (x, y, w, h) {
        if (w < 0) w = 0;
        if (h < 0) h = 0;

        return new ImageView(this.img, {
            x: this.x0 + x,
            y: this.y0 + y,
            w,
            h
        });
    }

    autocrop () {
        const { data, pitch, w, h } = this;

        let cropY0 = 0;
        while (cropY0 < h) {
            let lb = false;
            const maxIndex = this.dataIndex(w, cropY0);
            for (let index = this.dataIndex(0, cropY0) ; index < maxIndex ; index += 4) {
                if (data.readUInt32BE(index) !== 0xFFFFFFFF) {
                    lb = true;
                    break;
                }
            }
            if (lb) break;
            cropY0++;
        }

        let cropY1 = h - 1;
        while (cropY1 >= 0) {
            let lb = false;
            const maxIndex = this.dataIndex(w, cropY1);
            for (let index = this.dataIndex(0, cropY1) ; index < maxIndex ; index += 4) {
                if (data.readUInt32BE(index) !== 0xFFFFFFFF) {
                    lb = true;
                    break;
                }
            }
            if (lb) break;
            cropY1--;
        }
        if (cropY1 < cropY0) cropY1 = cropY0 - 1;

        let cropX0 = 0;
        while (cropX0 < w) {
            let lb = false;
            const maxIndex = this.dataIndex(cropX0, h);
            for (let index = this.dataIndex(cropX0, 0) ; index < maxIndex ; index += pitch) {
                if (data.readUInt32BE(index) !== 0xFFFFFFFF) {
                    lb = true;
                    break;
                }
            }
            if (lb) break;
            cropX0++;
        }

        let cropX1 = w - 1;
        while (cropX1 >= 0) {
            let lb = false;
            const maxIndex = this.dataIndex(cropX1, h);
            for (let index = this.dataIndex(cropX1, 0) ; index < maxIndex ; index += pitch) {
                if (data.readUInt32BE(index) !== 0xFFFFFFFF) {
                    lb = true;
                    break;
                }
            }
            if (lb) break;
            cropX1--;
        }
        if (cropX1 < cropX0) cropX1 = cropX0 - 1;

        return this.crop(
            cropX0,
            cropY0,
            cropX1 - cropX0 + 1,
            cropY1 - cropY0 + 1
        );
    }

    toJimp () {
        return this.toJimpWithPad(0);
    }

    toJimpWithPad (padding) {
        const outImg = new Jimp(
            this.w + padding * 2,
            this.h + padding * 2,
            0xFFFFFFFF
        );
        const outData = outImg.bitmap.data;
        const { data: srcData, w, h, pitch: srcPitch } = this;
        const dstPitch = (this.w + padding * 2) * 4;

        let srcIndex = this.dataIndex(0, 0);
        let dstIndex = padding * 4 + padding * dstPitch;
        const copyLength = w * 4;

        for (let y = 0 ; y < h ; y++) {
            srcData.copy(outData, dstIndex, srcIndex, srcIndex + copyLength);
            srcIndex += srcPitch;
            dstIndex += dstPitch;
        }
        return outImg;
    }
}

export default ImageView;
