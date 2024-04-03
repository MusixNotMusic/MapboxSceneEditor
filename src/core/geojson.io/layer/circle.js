import { randomRgb } from '../utils/lib';

export const drawCircle = (map, geojson) => {
    const id = 'line-' + Date.now();
    if (!map.getSource(id)) {
        map.addSource(id, { type: 'geojson', data: geojson });
    } 

    if (!map.getLayer(id)) {
        let layer = {
            id: id,
            type: "circle",
            source: id,
            paint: {
                'circle-color': randomRgb(),
                "circle-radius": 5,
            }
        };

        map.addLayer(layer);
    }
}