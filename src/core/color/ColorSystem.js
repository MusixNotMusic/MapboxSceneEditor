import * as THREE from "three";
import { cloneDeep } from "lodash";
import { colors } from './constants';

/**
 *  颜色系统：
 *  讲纹理色卡 与 http请求色卡 统一管理
 *
 */
export class ColorSystem {
    constructor() {
        this.colorMapTexture = {};
        this.colorList = {};
        this.colorCardTable = {};
        this.transitionMethodTable = {};
    }

    initColorTexture () {
        const loader = new THREE.TextureLoader();
        const promiseArr = colors.map(color => {
            return new Promise((resolve, reject) => {
                loader.load( color.path, (texture) => {
                    this.colorMapTexture[color.name] = texture;
                    this.colorCardTable[color.name] = this.readImageColorCard(texture.source.data);
                    resolve(texture);
                })
            })
        });

        return Promise.allSettled(promiseArr);
    }

    initColorList (colorList) {
        this.colorList = colorList;
        this.generateTransitionMethodTable();
        this.generateTextureByColorList();
    }

    /**
     * 读取图片 像素
     * @param image
     * @returns {*[]}
     */
    readImageColorCard (image) {
        const width = image.width;
        const height = image.height;

        const colorCard = []

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            colorCard.push(`${imageData.data[i]}, ${imageData.data[i + 1]}, ${imageData.data[i + 2]}`)
        }
        return colorCard;
    }

    /**
     * 是否有 这个颜色类型
     * @param type
     * @returns {boolean}
     */
    hasColorType (type) {
        return Object.keys(this.colorMapTexture).some(key => key === type);
    }

    /**
     * 是否有 这个函数转换类型
     * @param type
     * @returns {boolean}
     */
    hasMethodType (type) {
        return Object.keys(this.transitionMethodTable).some(key => key === type);
    }

    getColorTypes () {
        return Object.keys(this.colorMapTexture);
    }

    getMethodTypes () {
        return Object.keys(this.transitionMethodTable);
    }

    getCustomTypes () {
        return colors.map(item => item.name);
    }

    getColorList (productType, colorType) {
        if (this.hasMethodType(productType) && this.hasColorType(colorType)) {
            if (productType === colorType) {
                return this.colorList[productType];
            } else {
               const colorList = cloneDeep(this.colorList[productType])
                colorList.forEach(item => {
                    item.color = this.colorCardTable[colorType][item.minIndex]
                })
                return colorList;
            }
        }

        return null;
    }

    /**
     * 读取纹理颜色 统过 16进制真值
     * @param colorType  颜色类型
     * @param methodType 转换函数类型
     * @param index      0~255
     */
    readColor (colorType, methodType, index) {
        if (!this.hasColorType(colorType)) {
            return new Error(`not find ${colorType} color type`);
        }

        if (!this.hasMethodType(methodType)) {
            return new Error(`not find ${methodType} method type`);
        }

        const color      = this.colorCardTable[colorType][index];
        const transition = this.transitionMethodTable[methodType];
        const res        = transition(index);

        res.color = color;

        return res;
    }

    /**
     * 生成 真值index 转化为 真值表
     */
    generateTransitionMethodTable () {
        if (this.colorList) {
           Object.entries(this.colorList).forEach(item => {
               const key   = item[0]
               const value = item[1]

               const method = (index) => {
                   const res = value.find(item => index >= item.minIndex && index < item.maxIndex)
                   if (res) {
                       return {
                           value: res.val,
                           unit: value.unit,
                           defaultColor: res.color
                       }
                   }
                   return null;
               }

               this.transitionMethodTable[key] = method;
           })
        }
    }

    /**
     * colorList 中的 颜色 处理为纹理
     * @param arr
     * @returns {DataTexture}
     */
    generateTexture (arr) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 256;
        canvas.height= 1;

        const imageData = ctx.createImageData(256, 1)
        arr.forEach(color => {
            const start = color.minIndex * 4;
            const end = color.maxIndex * 4;
            const colors = color.color.split(',')
            for(let i = start; i < end; i += 4 ) {
                imageData.data[i] = colors[0]
                imageData.data[i + 1] = colors[1]
                imageData.data[i + 2] = colors[2]
                imageData.data[i + 3] = colors[3] || 255
            }
        })
        ctx.putImageData(imageData, 0, 0);

        const url = canvas.toDataURL("image/png", 1.0);

        const loader = new THREE.TextureLoader();

        return new Promise((resolve) => {
            loader.load(url, (texture) => {
                resolve(texture);
            })
        })
    }

    generateTextureByColorList() {
        if (this.colorList) {
            Object.entries(this.colorList).forEach(item => {
                const key   = item[0];
                const value = item[1];
                this.generateTexture(value).then(texture => {
                    this.colorMapTexture[key] = texture;
                    this.colorCardTable[key]  = this.readImageColorCard(texture.source.data);
                })
            })
        }
    }

    /**
     * 下载色卡
     * @param arr
     * @param filename
     */
    downloadColorCard(arr, filename) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 256;
        canvas.height= 1;

        const imageData = ctx.createImageData(256, 1)
        arr.forEach(color => {
            const start = color.minIndex * 4;
            const end = color.maxIndex * 4;
            const colors = color.color.split(',')
            for(let i = start; i < end; i += 4 ) {
                imageData.data[i] = colors[0]
                imageData.data[i + 1] = colors[1]
                imageData.data[i + 2] = colors[2]
                imageData.data[i + 3] = colors[3] || 255
            }
        })
        ctx.putImageData(imageData, 0, 0);

        const blobCallback = (imageName) => {
            return (b) => {
                const a = document.createElement("a");
                a.textContent = "Download";
                document.body.appendChild(a);
                a.style.display = "block";
                a.download = `${imageName}.png`;
                a.href = window.URL.createObjectURL(b);
                a.click();
            };
        }

        canvas.toBlob(
            blobCallback(filename || "Z"),
            "image/png",
            1
        );
    }

    dispose () {
        this.colorList = null;
        if (this.colorMapTexture) {
            Object.values(this.colorMapTexture).forEach(item => {
                item.dispose();
            })
            this.colorMapTexture = null;
        }

        if (this.transitionMethodTable) {
            Object.values(this.transitionMethodTable).forEach(item => {
                item = null;
            })
            this.colorMapTexture = null;
        }
    }
}