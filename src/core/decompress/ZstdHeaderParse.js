export function isZip (uint8Arr) {
    return uint8Arr[0] === 0x50 && uint8Arr[1] === 0x4b && uint8Arr[2] === 0x03 && uint8Arr[3] === 0x04
}

export function isZstd (uint8Arr) {
    return uint8Arr[0] === 0x28 && uint8Arr[1] === 0xB5 && uint8Arr[2] === 0x2F && uint8Arr[3] === 0xFD
}
