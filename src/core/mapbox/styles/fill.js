import { StyleClass } from './style';
import { randomRgb } from '../../color/color';

/**
 * https://docs.mapbox.com/style-spec/reference/layers/#fill
 */
export class FillStyleClass extends StyleClass{
    constructor(id, map, geojson, fd) {
        super();
        this.id = id;
        this.map = map;
        this.geojson = geojson;
        this.fd = fd;

        this.type = 'fill';
        this.paint = {
            'fill-color': randomRgb()
        }
        this.layout = {}

        this.paramsTable = [
            { name: 'opacity', type: 'paint' },
            { name: 'color',   type: 'paint', value: this.paint['fill-color'] },
            { name: 'outline-color', type: 'paint' },
        ]

        this.generateParamsFunction();
    }
}