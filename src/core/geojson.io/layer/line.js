import { randomRgb } from '../utils/lib';

export const drawLine = (map, geojson) => {
    const id = 'line-' + Date.now();
    if (!map.getSource(id)) {
        map.addSource(id, { type: 'geojson', data: geojson });
    } 

    if (!map.getLayer(id)) {
        let layer = {
            id: id,
            type: "line",
            source: id,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': randomRgb(),
                'line-width': 3
            }
        };

        map.addLayer(layer);
    }
}