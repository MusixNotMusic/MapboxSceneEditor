import { unzip } from "fflate";
import { isZip, isZstd } from './ZstdHeaderParse'
import { ZSTDDecoder } from "zstddec";

export function decompress(buf, filename) {
    let u8Arr = new Uint8Array(buf);
    // console.log('uint8Array ==>', u8Arr, filename)
    return new Promise(async (resolve, reject) => {
        const head = u8Arr.slice(0, 4)
        if (isZip(head)) {
            unzip(u8Arr, (err, data) => {
                if (data) {
                    if (filename === undefined) {
                        resolve(Object.values(data)[0]);
                    } else {
                        resolve(data[filename]);
                    }
                } else {
                    reject(err);
                }
            });
        } else if (isZstd(head)) {
            const decoder = new ZSTDDecoder ();
            decoder.init().then(() => {
                const data = decoder.decode( u8Arr );
                resolve(new Uint8Array(data));
            }).catch((e) =>{
                reject(e)
            })
        } else {
            resolve(new Uint8Array(buf));
        }
    });

}

