/**
 * 读取 文本文件
 * @param {*} f 
 * @returns 
 */
export function readAsText(f) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.readAsText(f);
            reader.onload = (e) => {
              if (e.target && e.target.result) {
                resolve(e.target.result);
              } else {
                reject('Dropped file could not be loaded');
              }
            };
            reader.onerror = () => {
              reject('Dropped file was unreadable');
            };
        } catch (e) {
            reject('Dropped file was unreadable');
        }
    })  
}

/**
 * 读取二进制buffer文件
 * @param {*} f 
 * @returns 
 */
export function readAsArrayBuffer(f) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.readAsArrayBuffer(f);
            reader.onload = (e) => {
              if (e.target && e.target.result) {
                resolve(e.target.result);
              } else {
                reject('Dropped file could not be loaded');
              }
            };
            reader.onerror = () => {
              reject('Dropped file was unreadable');
            };
        } catch (e) {
            reject('Dropped file was unreadable');
        }
    })  
}

export function readAsDom(x) {
  return new DOMParser().parseFromString(x, 'text/xml');
}
