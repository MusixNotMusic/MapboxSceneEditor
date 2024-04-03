import { bbox } from '@turf/turf';

export function zoomextent (map, geojson) {
  // if the data is a single point, flyTo()
  if (
    geojson.features.filter((feature) => feature.geometry).length === 1 &&
    geojson.features[0].geometry.type === 'Point'
  ) {
    map.flyTo({
      center: geojson.features[0].geometry.coordinates,
      zoom: 6,
      duration: 1000
    });
  } else {
    const bounds = bbox(geojson);
    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }
};
