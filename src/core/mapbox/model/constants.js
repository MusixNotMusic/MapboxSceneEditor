export const colors = [
    { name: 'Z', path: '/color/Z1.png' },
    { name: 'colors1', path: '/color/colors1.png' },
    { name: 'blue', path: '/color/blue.png'},
    { name: 'rainbow1', path: '/color/rainbow1.png'},
    { name: 'rainbows', path: '/color/rainbows.png'},
    { name: 'extreme', path: '/color/extreme.png'},
    { name: 'horizon', path: '/color/horizon.png'},
    { name: 'skyline', path: '/color/skyline.png'},
    { name: 'smallrainbows', path: '/color/smallrainbows.png'},
    { name: 'plasma', path: '/color/plasma.png'},
    { name: 'natural', path: '/color/natural.png'},
    { name: 'viridis', path: '/color/viridis.png'},
    { name: 'gray', path: '/color/gray.png'},
    { name: 'rainbow', path: '/color/rainbow.png'},
]


export const getColorSystem = () => {
    return window['__YW__']['colorSystem']
}

export const getResourceCache = () => {
    return window['__YW__']['resourceCache']
}