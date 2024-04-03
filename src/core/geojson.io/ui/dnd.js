import { readDrop } from '../lib/readfile';
import { flash } from './flash';
import { zoomextent } from '../lib/zoomextent';
import * as d3 from 'd3';

/**
 * 
 * @param {*} context 
 * @param {*} successCallback 
 * @param {*} errorCallback 
 * @param {*} warnningCallback 
 */
export function geojsonIO(map, successCallback, errorCallback, warnningCallback) {
  d3.select('#map-wrap')
    .attr('dropzone', 'copy')
    .on('drop', drop)
    .on('dragenter', over)
    .on('dragleave', exit)
    .on('dragover', over);

  function drop(ev) {
    ev.preventDefault();
    dropOver(ev);
  }

  function dropOver (event) {
    readDrop(event, (err, gj, warning) => {
      console.log('gj ==>', gj)
      if (err && err.message) {
        errorCallback && errorCallback(err)
      }
      if (gj && gj.features) {
        const geojson = {
          type: 'FeatureCollection',
          features: gj.features 
        };
        if (warning) {
          warnningCallback && warnningCallback(warning)
        } else {
          successCallback && successCallback(geojson)
        }
        zoomextent(map, geojson);
      }
      d3.select('body').classed('dragover', false);
    })()
  }

  function over(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    d3.select('body').classed('dragover', true);
  }

  function exit(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    d3.select('body').classed('dragover', false);
  }
};
