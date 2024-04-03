import { StyleClass } from './style';
import { randomRgb } from '../../color/color';

/**
 * https://docs.mapbox.com/style-spec/reference/layers/#line
 */
export class LineStyleClass extends StyleClass{
    constructor(id, map, geojson, fd) {
        super(id, map, geojson);
        this.id = id;
        this.map = map;
        this.geojson = geojson;
        this.fd = fd; 

        this.type = 'line';
        
        this.paint = {
            'line-color': randomRgb(),
            'line-width': 4
        }

        this.layout = {
            'line-join': 'round',
            'line-cap': 'round'
        }

        this.paramsTable = [
            { name: 'cap', type: 'paint' },
            { name: 'color',   type: 'paint', value: this.paint['line-color'] },
            { name: 'dasharray', type: 'paint' },
            { name: 'gap-width', type: 'paint' },
            { name: 'offset', type: 'paint' },
            { name: 'opacity', type: 'paint' },
            { name: 'width', type: 'paint', value: this.paint['line-width'] },
        ]

        this.generateParamsFunction();
    }
}