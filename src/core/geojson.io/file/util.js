export function wrapGeojsonData(fd, data) {
    return {
        fd: fd,
        type: 'geojson',
        data: data
    }
}

export function wrapZipData(fd, data) {
    return {
        fd: fd,
        type: 'zip',
        data: data
    }
}