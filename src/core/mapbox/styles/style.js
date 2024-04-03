import { toHeadUpperCaseCamelCase, toCamelCase } from '../utils';

export class StyleClass {
    constructor(id, map, geojson) {
        this.id = id;
        this.map = map;
        this.geojson = geojson;

        this.type = '';
        this.paint = {}
        this.layout = {}

        this.hoverOpactiy = 0.0;

        this.paramsTable = [];
    }

    hasLayer() {
        const { id, map } = this;
        return !!map.getLayer(id);
    }

    /**
     * 添加层
     */
    addLayer() {
        const { id, map, geojson } = this;

        const source = map.getSource(id);
        
        if (!source) {
            map.addSource(id, { type: 'geojson', data: geojson });
        } else {
            source.setData(geojson)
        }
    
        if (!map.getLayer(id)) {
            let layer = {
                id: id,
                type: this.type,
                source: id,
                paint: this.paint,
                layout: this.layout
            };
    
            map.addLayer(layer);
        }
    }

    /**
     * 删除层
     */
    removeLayer() {
        const { id, map } = this;
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
    }
    

    showLayer(show) {
        this.setLayoutProperty('visibility', show ? 'visible' : 'none');
    }


    setPaintProperty(key, value) {
        const { id, map } = this;
        if (this.hasLayer()) {
            map.setPaintProperty(id, key, value);
        }
    }

    setLayoutProperty(key, value) {
        const { id, map } = this;
        if (this.hasLayer()) {
            map.setLayoutProperty(id, key, value);
        }
    }

    getTypePrefixFullName(value) {
        return this.type + '-' + value;
    }


    generateParamsFunction () {
        this.paramsTable.forEach(item => {
            const functionName = toCamelCase('set-' + item.name);
            this.__proto__[functionName] = function (value) {
                if (item.type === 'paint') {
                    this.setPaintProperty(this.getTypePrefixFullName(item.name), value);
                } else if (item.type === 'layout')  {
                    this.setLayoutProperty(this.getTypePrefixFullName(item.name), value);
                }
            }
        })
    }
}