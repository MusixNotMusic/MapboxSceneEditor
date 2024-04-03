import { 
    Object3D,
    Vector3
} from 'three';

import mapboxgl from "mapbox-gl";

export const earthRadius = 6371008.8;

/*
 * The average circumference of the earth in meters.
 */
export const earthCircumference = 2 * Math.PI * earthRadius;

const meterApplyX = mx => mx * earthCircumference
const meterApplyY = mx => -mx * earthCircumference

export class WGS84Object3D extends Object3D {
    constructor(object) {
        super();
        this._WGS84Position = new Vector3();
        this.isWGS84Object3D = true;
        if (object) {
            this.add(object);
        }
    }

    /**
        mercator x -> 0 ~ 1
        mercator y -> 0 ~ 1
        meter x coordination [-earthCircumference / 2, earthCircumference / 2]
        meter y coordination [earthCircumference / 2, -earthCircumference / 2]
     */
    set WGS84Position (position) {
        // console.log('set WGS84Position', position,  this._WGS84Position);
        const mercator = mapboxgl.MercatorCoordinate.fromLngLat([position.x, position.y], position.z);

        this.position.set(meterApplyX(mercator.x), meterApplyY(mercator.y), position.z || 0);
        // this.position.set(mercator.x, mercator.y, position.z || 0);
      
        if (!this._WGS84Position) {
            this._WGS84Position = new Vector3();
        } else {
            if (!this._WGS84Position.equals(position)) {
                this._WGS84Position = position;
            }
        }
    }

    get WGS84Position () {
        return this._WGS84Position;
    }
}