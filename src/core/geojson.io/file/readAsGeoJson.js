import osmtogeojson from 'osmtogeojson';
import * as toGeoJSON from '@tmcw/togeojson';
import { csv2geojson } from 'csv2geojson';
import polytogeojson from 'polytogeojson';
import geojsonNormalize from '@mapbox/geojson-normalize';
import gtfs2geojson from '../lib/gtfs2geojson';
import * as shapefile from 'shapefile';

import { readAsDom } from './readRawFile';

/**
 * Read google earth file kml type.
 * @param {*} text 
 * @returns 
 */
export function readKml (text) {
    return new Promise((resolve, reject) => {
        const kmldom = readAsDom(text);
        if (!kmldom) {
            reject('Invalid KML file: not valid XML');
        }

        let warning;
        if (kmldom.getElementsByTagName('NetworkLink').length) {
            warning = {
                message:
                'The KML file you uploaded included NetworkLinks: some content may not display. ' +
                'Please export and upload KML without NetworkLinks for optimal performance'
            };
        }

        resolve({
            data: toGeoJSON.kml(kmldom),
            warning: warning
        })
    })
}

/**
 * Read xml file.
 * @param {*} text 
 * @returns 
 */
export function readXml (text) {
    return new Promise((resolve, reject) => {
        const xmldom = readAsDom(text);
        if (!xmldom) {
            reject( 'Invalid XML file: not valid XML');
        }
        const result = osmtogeojson.toGeojson(xmldom);
        // only keep object tags as properties
        result.features.forEach((feature) => {
            feature.properties = feature.properties.tags;
        });
        resolve({ data: result });
    })
}

/**
 * Read GPX file.
 * @param {*} text 
 * @returns 
 */
export function readGpx (text) {
    return Promise.resolve({ data: toGeoJSON.gpx(readAsDom(text)) });
}

/**
 * Read GeoJson file.
 * @param {*} text 
 * @returns 
 */
export function readGeoJson (text) {
    return new Promise((resolve, reject) => {
        try {
            const gj = JSON.parse(text);
            if (gj && gj.type === 'Topology' && gj.objects) {
              const collection = { type: 'FeatureCollection', features: [] };
              for (const o in gj.objects) {
                const ft = topojson.feature(gj, gj.objects[o]);
                if (ft.features) {
                    collection.features = collection.features.concat(ft.features);
                } else { 
                    collection.features = collection.features.concat([ft]);
                }
              }
              resolve({ data: collection });
            } else {
              resolve({ data: gj });
            }
          } catch (err) {
            reject('Invalid JSON file: ' + err);
          }
    })
}

/**
 * Read csv tsv dsv file.
 * @param {*} text 
 * @returns 
 */
export function readCsv (text) {
    return new Promise((resolve, reject) => {
        csv2geojson.csv2geojson(text, { delimiter: 'auto' },
            (err, result) => {
                if (err) {
                    return reject({
                        type: 'geocode',
                        result: result,
                        raw: text
                    });
                } else {
                    return resolve({ data: result });
                }
        });
    })
}

export function readGtfsShapes (text) {
    return new Promise((resolve, reject) => {
        try {
            return resolve({ data: gtfs2geojson.lines(text) });
          } catch (e) {
            return reject('Invalid GTFS shapes.txt file');
          }
    })
}


export function readGtfsStops (text) {
    return new Promise((resolve, reject) => {
        try {
            return resolve({ data: gtfs2geojson.stops(text) });
          } catch (e) {
            return reject('Invalid GTFS stops.txt file');
          }
    })
}

export function readPloy (text) {
    return Promise.resolve({ data: polytogeojson(text) });
}

export function readShape (text) {
   const features = [];
   return shapefile.open(text)
     .then(source => 
        source.read().then(function log(result) {
            if (result.done) {
                console.log('done');
                return { data: { type: 'FeatureCollection', features } }
            }
            features.push(result.value);
            return source.read().then(log);
        })
     )
   .catch(error => console.error(error.stack));
}