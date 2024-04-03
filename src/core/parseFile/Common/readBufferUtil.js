/**
 * @param {ArrayBufferLike} buffer 二进制数据缓冲区（字节数组）
 * @param {string} byteType 要读取的类型化数组类型
 * @param {number} byteOffset 偏移量
 * @param {number} byteLength 读取数量
 * @param {string} resType 期望返回的值类型，默认为 number ，array 主要用于中文编码传输解析
 * @return { number|TypedArray }
 * */
export const getDataFromBuffer = (buffer, byteType, byteOffset, byteLength, resType = 'number') => {
  let result;

  switch (byteType) {
    case 'Int8':
      if (buffer.byteLength < byteOffset + byteLength) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer, byteOffset, byteLength).getInt8(0);
      if (resType === 'array') result = new Int8Array(buffer, byteOffset, byteLength);
      break;
    case 'Uint8':
      if (buffer.byteLength < byteOffset + byteLength) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer, byteOffset, byteLength).getUint8(0);
      if (resType === 'array') result = new Uint8Array(buffer, byteOffset, byteLength);
      break;
    case 'Int16':
      if (buffer.byteLength < byteOffset + byteLength * 2) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 2), 0).getInt16(0, true);
      if (resType === 'array') result = new Int16Array(buffer.slice(byteOffset, byteOffset + byteLength * 2));
      break;
    case 'Uint16':
      if (buffer.byteLength < byteOffset + byteLength * 2) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 2), 0).getUint16(0, true);
      if (resType === 'array') result = new Uint16Array(buffer.slice(byteOffset, byteOffset + byteLength * 2));
      break;
    case 'Int32':
      if (buffer.byteLength < byteOffset + byteLength * 4) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 4), 0).getInt32(0, true);
      if (resType === 'array') result = new Int32Array(buffer.slice(byteOffset, byteOffset + byteLength * 4));
      break;
    case 'Uint32':
      if (buffer.byteLength < byteOffset + byteLength * 4) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 4), 0).getUint32(0, true);
      if (resType === 'array') result = new Uint32Array(buffer.slice(byteOffset, byteOffset + byteLength * 4));
      break;
    case 'Float32':
      if (buffer.byteLength < byteOffset + byteLength * 4) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 4), 0).getFloat32(0, true);
      if (resType === 'array') result = new Float32Array(buffer.slice(byteOffset, byteOffset + byteLength * 4));
      break;
    case 'Float64':
      if (buffer.byteLength < byteOffset + byteLength * 8) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 8), 0, byteLength).getFloat64(0, true);
      if (resType === 'array') result = new Float64Array(buffer.slice(byteOffset, byteOffset + byteLength * 8));
      break;
    case 'Uint64':
      if (buffer.byteLength < byteOffset + byteLength * 8) throw new Error('sub-region exceeds array bounds.');
      if (resType === 'number') result = getUint64(new DataView(buffer.slice(byteOffset, byteOffset + byteLength * 8), 0), 0, true);
      break;
    default:
      console.error(`no supported byteType: ${byteType}`);
  }

  return result;
};

/**
 * @desc 支持 64 位整数值读取
 * */
function getUint64 (dataView, byteOffset, littleEndian) {
  // 将 64 位整数值分成两份 32 位整数值
  const left = dataView.getUint32(byteOffset, littleEndian);
  const right = dataView.getUint32(byteOffset + 4, littleEndian);

  // 合并两个 32 位整数值
  const combined = littleEndian ? left + 2 ** 32 * right : 2 ** 32 * left + right;

  if (!Number.isSafeInteger(combined)) {
    console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');
  }

  return combined;
}
