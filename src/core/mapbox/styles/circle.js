import { StyleClass } from './style';
import { randomRgb } from '../../color/color';

/**
 * https://docs.mapbox.com/style-spec/reference/layers/#fill
 */
export class CircleStyleClass extends StyleClass{
    constructor(id, map, geojson, fd) {
        super();
        this.id = id;
        this.map = map;
        this.geojson = geojson;
        this.fd = fd;

        this.type = 'circle';
        this.paint = {
            'circle-color': randomRgb(),
            'circle-radius': 5
        }
        this.layout = {}

        this.paramsTable = [
            { name: 'blur',           type: 'paint' },
            { name: 'color',          type: 'paint', value: this.paint['circle-color'] },
            { name: 'opacity',        type: 'paint' },
            { name: 'radius',         type: 'paint', value: this.paint['circle-radius'] },
            { name: 'stroke-color',   type: 'paint' },
            { name: 'stroke-opacity', type: 'paint' },
            { name: 'stroke-width',   type: 'paint' },
        ]

        this.generateParamsFunction();
    }
}