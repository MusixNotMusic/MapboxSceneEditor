import { getDataFromBuffer } from "./readBufferUtil";
export const bufferTypeTable = {
    'char': 'Int8',
    'short': 'Int16',
    'short int': 'Int16',
    'int': 'Int32',
    'long': 'Int32',
    'long int': 'Int32',
    'long long': 'Int64',
    'long long int': 'Int64',
    'float': 'Float32',
    'double': 'Float64',
}

export const signTypeTable = {
    'unsigned': 'U',
    'signed': ''
}

export const dataTypeRef = /(unsigned|signed)?([\w\s]+)/
/**
 * 解析c/cpp 数据类型 为 Arraybuffer
 * @param dataType
 */
function parseDataType (dataType) {
    if (typeof dataType !== 'string') {
        return new Error('Data Type Error');
    }

    const res = dataType.trim().match(dataTypeRef)
    const signType = signTypeTable[res[1]];
    const bufferType = bufferTypeTable[res[2].trim()];

    const type = signType ? signType + bufferType.toLowerCase() : bufferType;
    return type || new Error('parseDataType is Error!');
}

/**
 * 配置表读取
 * @param buffer
 * @param table
 * @returns {{}}
 */
export function readBufferByTable (buffer, table) {
    const res = {}
    let pos = 0;
    table.forEach((item, index) => {
        const dataType = parseDataType(item.type);
        const byteLength = item.size;
        const returnType = item.size > 1 ? 'array' : 'number';
        // console.log(item, index, buffer, pos);
        res[item.label] = getDataFromBuffer(buffer, dataType, pos, byteLength, returnType);
        if (item.method) {
            res[item.label] = item.method(res[item.label]);
        }
        pos += byteLength * item.byteSize;
    })

    return res;
}

